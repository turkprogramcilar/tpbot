const bot = require("./webserver/server.js");
require("./discordbot/bot.js")
    .set_sendallF(bot.send_all);