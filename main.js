const { json } = require("express");

const webserver =
    process.env.DCBOT_WEBSERVER != undefined && process.env.DCBOT_WEBSERVER != 'false'
    ? require("./webserver/server.js")
    : undefined;

let bots = JSON.parse(process.env.DCBOT_JSON)
Object.keys(bots).forEach(function(token) {
    
    const modules = bots[token];
    let bot = require("./discordbot/bot.js")
    bot.init({}, token, modules);
    if (webserver != undefined && modules.includes("wschannel"))
        bot.set_sendallF(webserver.send_all);
})
console.log('OK')

