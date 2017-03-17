export class WordDetect {
    private _word2: {
        key: string | RegExp,
        action: (data?: MessageEvents) => Promise<any>
    }[] = [];

    constructor() { }

    register = (key: string | RegExp, fn: (data?: MessageEvents)=>Promise<any>) => {
        if (this._word2.find(ele => ele.key === key)) return false;
        this._word2.push({ key: key, action: fn });
        return true;
    }

    unregister = (key: string | RegExp) => {
        this._word2.splice(this._word2.findIndex(ele => { return ele.key === key }), 1);
    }

    runCommand = (key: string, data?: MessageEvents) => {
        let result = this._word2.filter(ele => {
            let regex = (ele.key instanceof RegExp) ? ele.key : new RegExp(ele.key);
            return regex.test(key);
        }).map(ele=>ele.action);
        
        return Promise.all(result.map(ele=>ele(data)));
    }
}
