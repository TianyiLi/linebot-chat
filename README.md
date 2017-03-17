# line bot

This is a simple linbot with typescript

modified ```src/config.ts``` for your provate token

### WordDetect

WordDetect support simple identifier to trigger the service which is register

```javascript
const wordDetect = new WordDetect()

wordDetect.register('hello', async data=>{
    let userInfo = await data.source.profile();
    let result = {
        type: 'text',
        content: 'Hello!' + userInfo.displayName
    }
    return wordTemplate(result.type, result.content);
})

```

Then, when you send 'hello' text to your bot, it would return ```Hello!, <your-name>```

And, I also made a simple definition types for the LineBot reponsive.

It might be help you to know more about message event.