require("./constants.js");

const parse   = require("./cmdparser.js");
const status  = require("./marquee_status.js");
const Discord = require('discord.js');

const client  = new Discord.Client();
const mpath = "./modules/";

let modules = [];
let state = {
    prefix = consts.env.prefix ?? "%",
};

exports.init = (token, mods = []) => {

    for (const m of mods) {
        modules[m] = require(mpath+m);
        modules[m].init(state);
    }
        
    client.login(token);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    status.init(client, msg_status);
});

client.on('messageReactionAdd', async (reaction,user) => {
    if (msg.author == client.user)
        return;

    for (const m of modules) 
        switch_module(m, 'messageReactionAdd', {reaction: reaction, user: user});
});
client.on('message', async msg => {
    if (msg.author == client.user)
        return;

    for (const m of modules)
        switch_module(m, 'message', {msg: msg});
    
    // beyond is only commands with prefixes, if not return immediately
    if (!parse.is(msg, state.prefix)) {        
        return;
    }

    // basic commands to test if bot is running
    if (parse.is(msg, "echo ")) {
        if (msg.content.length>0)
            msg.channel.send(msg.content);
        return;
    }
    if (parse.is(msg, "echoq ")) {
        if (msg.content.length>0)
            msg.channel.send(parse.tqs(msg.content));
        return;
    }

    // beyond is administrative or feature previews only, 
    // if not admin return
    if (msg.author.id in uid_admins == false)
        return;

    // beyond is admin + fix prefix,
    if (!parse.is(msg, "fix"))
        return;

    // syncs channel permssions with categories belonging caid_fix in constants
    if (parse.is(msg, "sync")) {
        // print all categories
        msg.guild.channels.cache.each(x=>{
            if (x.type == "text" && x.parent) {
                x.lockPermissions()
                    .then(() => console.log('Successfully synchronized permissions with parent channel'+`${x.parent.name}->${x.name}`))
                    .catch(console.error);
            }
        });
    }
});

function switch_module(module, evt, args) {
    if (!modules[module]) return false;
    modules[module].on_event(evt, args);
    return true;
}

var ws = {};
module.exports.set_sendallF = (f) => {
    ws.send_all = f;
}
