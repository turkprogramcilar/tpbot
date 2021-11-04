const { json } = require("express");
BigInt.prototype.toJSON = function() { return this.toString() }

const webserver =
    process.env.DCBOT_WEBSERVER != undefined && process.env.DCBOT_WEBSERVER != 'false'
    ? require("./webserver/server.js")
    : undefined
    ;

const env_check = (env, name) => { if (env) console.warn(`${name} [VALUE=${env}]`); };
env_check(process.env.DCBOT_DEBUG, "DCBOT_DEBUG");
env_check(process.env.DCBOT_WEBSERVER, "DCBOT_WEBSERVER");


let bots = JSON.parse(process.env.DCBOT_JSON)
Object.keys(bots).map(async function(token) {
    
    const modules = bots[token];
    let bot = require("./discordbot/bot.js")
    await bot.init({}, token, modules, webserver?.send_all);
})