const webserver =
    process.env.WEBSERVER != undefined && process.env.WEBSERVER != 'false'
    ? require("./webserver/server.js")
    : undefined;

const bot = require("./discordbot/bot.js")

if (webserver != undefined)
    bot.set_sendallF(webserver.send_all);