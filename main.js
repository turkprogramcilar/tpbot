const webserver =
process.env.WEBSERVER == null || process.env.WEBSERVER != false
? require("./webserver/server.js")
: null;

const bot = require("./discordbot/bot.js")

if (webserver != null)
bot.set_sendallF(webserver.send_all);