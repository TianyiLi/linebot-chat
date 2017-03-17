import * as events from 'events';
import * as fetch from 'node-fetch';
import * as crypto from 'crypto';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { Response } from "node-fetch";

class LineBot extends events.EventEmitter {
    endpoint: string;
    options = {
        channelId: "",
        channelSecret: "",
        channelAccessToken: "",
        verify: false
    };
    headers: {
        Accept: string,
        'Content-Type': string,
        Authorization: string
    };
    constructor(options) {
        super();
        this.options.channelId = options.channelId || '';
        this.options.channelSecret = options.channelSecret || '';
        this.options.channelAccessToken = options.channelAccessToken || '';
        this.options.verify = true;
        this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.options.channelAccessToken
        };
        this.endpoint = 'https://api.line.me/v2/bot';
    }
    verify = (rawBody, signature) => {
        const hash = crypto.createHmac('sha256', this.options.channelSecret)
            .update(rawBody, 'utf8')
            .digest('base64');
        return hash === signature;
    }
    parse = (body) => {
        if (!body || !body.events) {
            return;
        }
        body.events.forEach((event) => {
            event.reply = (message) => {
                return this.reply(event.replyToken, message);
            };
            if (event.source) {
                event.source.profile = () => {
                    return this.getUserProfile(event.source.userId);
                };
            }
            if (event.message) {
                event.message.content = () => {
                    return this.getMessageContent(event.message.id);
                };
            }
            process.nextTick(() => {
                this.emit(event.type, event);
            });
        });
    }

    static createMessages(message) {
        if (typeof message === 'string') {
            return [{ type: 'text', text: message }];
        }
        if (Array.isArray(message)) {
            return message.map((m) => {
                if (typeof m === 'string') {
                    return { type: 'text', text: m };
                }
                return m;
            });
        }
        return [message];
    }

    reply = (replyToken, message) => {
        const body = {
            replyToken: replyToken,
            messages: LineBot.createMessages(message)
        };
        return this.post('/message/reply', body).then((res)=>{
            return res.json();
        });
    }
    push = (to, message) => {
        if (Array.isArray(to)) {
            return Promise.all(to.map(recipient => this.push(recipient, message)));
        }
        const body = {
            to: to,
            messages: LineBot.createMessages(message)
        };
        return this.post('/message/push', body).then((res) => {
            return res.json();
        });
    }

    getUserProfile = (userId) => {
        return this.get('/profile/' + userId).then((res)=>{
            return res.json();
        });
    }

    getMessageContent: (messageId: string) => Promise<Buffer> = (messageId) => {
        return this.get('/message/' + messageId + '/content/').then( (res) => {
            let r: any = res;
            return r.buffer();
        });
    }

    leaveGroup = (groupId) => {
        return this.post('/group/' + groupId + '/leave/').then((res) => {
            return res.json();
        });
    }

    leaveRoom = (roomId) => {
        return this.post('/room/' + roomId + '/leave/').then((res) => {
            return res.json();
        });
    }

    get: (path: string) => Promise<Response> = (path) => {
        let f: any = fetch;
        return f(this.endpoint + path, { method: 'GET', headers: this.headers });
    }
    post: (path: string, body?: any) => Promise<Response> = (path, body) => {
        let f: any = fetch;
        return f(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
    }
    parser() {
        const parser = bodyParser.json({
            verify: (req: any, res, buf, encoding) => {
                req.rawBody = buf.toString(encoding);
            }
        });
        return (req, res) => {
            parser(req, res, () => {
                if (this.options.verify && !this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                    return res.sendStatus(400);
                }
                this.parse(req.body);
                return res.json({});
            });
        };
    }

    // Optional built-in http server
    listen(path, port, callback?) {
        const parser = bodyParser.json({
            verify: (req: any, res, buf, encoding) => {
                req.rawBody = buf.toString(encoding);
            }
        });
        const server = http.createServer((req: any, res: any) => {
            const signature = req.headers['x-line-signature']; // Must be lowercase
            res.setHeader('X-Powered-By', 'linebot');
            if (req.method === 'POST' && req.url === path) {
                parser(req, res, () => {
                    if (this.options.verify && !this.verify(req.rawBody, signature)) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'text/html; charset=utf-8');
                        return res.end('Bad request');
                    }
                    this.parse(req.body);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end('{}');
                });
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.end('Not found');
            }
        });
        return server.listen(port, callback);
    }
}

export function createBot(options) { return new LineBot(options); }