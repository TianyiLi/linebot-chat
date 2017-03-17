import { WordDetect } from './lib';
import * as linebot from 'linebot';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { Server } from "http";
import { createBot } from './lib';
import { config } from './config';

const wrap = fn => { try { fn(); } catch (err) { console.log(err); } };
const LINEBOT_PORT = 3000;
const wordDetect = new WordDetect();

let customer = [];

let bot = createBot({
    channelId: config.CHANNEL_ID,
    channelSecret: config.CHANNEL_SECRET,
    channelAccessToken: config.CHANNEL_ACCESS_TOKEN
});

function wordTemplate(type: string, content: any): MessageObject.Text | MessageObject.Image {
    switch (type) {
        case 'text':
            return { type: 'text', text: content };
        case 'image':
            let previewImageUrl = ('previewImageUrl' in content) ? content.previewImageUrl : content.originalContentUrl;
            return { type: 'image', originalContentUrl: content.originalContentUrl, previewImageUrl: previewImageUrl };
    }
}

wordDetect.register('pic',async data => {
    let result = {
        type: 'image',
        content: {
            originalContentUrl: 'https://www.qrstuff.com/images/default_qrcode.png'
        }
    };
    return wordTemplate(result.type, result.content);
});

wordDetect.register('hello',async data => {
    let userInfo = await data.source.profile();
    let result = {
        type: 'text',
        content: 'Hello!' + userInfo.displayName
    }
    return wordTemplate(result.type, result.content);
});

wordDetect.register('nothing', async data => {
    let user = await data.source.profile();
    let result = {
        type: 'text',
        content: 'hello! this is nothing' + user.displayName
    }
    return wordTemplate(result.type, result.content);
})

async function test() {
    return 'stat';
}

wordDetect.register('c8763|星暴氣流斬',async data => {
    let result = {
        type: 'text',
        content: '噓爆你！！！！'
    }
    return wordTemplate(result.type, result.content);
});

wordDetect.register('.', async data=>{
    let result = {
        type: 'text',
        content: '0.0'
    };
    return wordTemplate(result.type, result.content);
})

bot.on('message', (event: MessageEvents) => {
    console.log(event);
    wrap(async () => {
        let userInfo = await event.source.profile();
        console.log(userInfo.displayName);
        let send = [];
        if (event.message.type === 'text') {
            send = await wordDetect.runCommand(event.message.text, event);
        }
        send = (send.length > 0) ? send : [{ type: 'text', text: `Hello, ${userInfo.displayName}, welcome to my bot, you are not typing correct command :D` }];
        let result = await event.reply(send);
        console.log(result);
    });
});

bot.on('follow', (event: FollowEvent) => {
    wrap(async () => {
        let userInfo = await event.source.profile();
        event.reply(wordTemplate('text', `Welcome!! ${userInfo.displayName}`));
    })
});
bot.on('unfollow', (event: UnFollowEvent) => {
    wrap(async () => {
        let userInfo = await event.source.profile();
        console.log(`${userInfo.userId} \n ${userInfo.displayName} is unfollow`);
    })
});

let botServer = bot.listen('/linewebhook', LINEBOT_PORT, () => { console.log(`LineBot Service Listen on ${LINEBOT_PORT}`) });
