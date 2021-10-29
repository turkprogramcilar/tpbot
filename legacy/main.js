const { json } = require("express");

const webserver =
    process.env.DCBOT_WSCHANNEL != undefined && process.env.DCBOT_WSCHANNEL != 'false'
    ? require("./webserver/server.js")
    : undefined
    ;

const env_check = (env, name) => { if (env) console.warn(`${name} [VALUE=${env}]`); };
env_check(process.env.DCBOT_DEBUG, "DCBOT_DEBUG");
env_check(process.env.DCBOT_WSCHANNEL, "DCBOT_WSCHANNEL");


let bots = JSON.parse(process.env.DCBOT_JSON)
Object.keys(bots).map(async function(token) {
    
    const modules = bots[token];
    let bot = require("./discordbot/bot.js")
    await bot.init({}, token, modules, webserver?.send_all);
})