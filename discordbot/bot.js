require("./constants.js");

const parse   = require("./cmdparser.js");
const status  = require("./marquee_status.js");
const Discord = require('discord.js');

const client  = new Discord.Client();
const mpath = "./modules/";

let modules = [];
let state = {
    arena       : require("./arena.js"),
    arena_toggle: true,
};

let prefix = process.env.DCBOT_PREFIX ?? "%";

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

function switch_module(module, msg, cmd=null) {
    if ((cmd && !parse.is(msg, cmd)) || !modules[module]) return false;
    modules[module].on_message(msg);
    return true;
}

const e = '🤌';
function sendAtaturk(channel) {
    return channel
        .send("https://cdn.discordapp.com/attachments/824578307722575892/828715024641163264/ataturk.png")
        .then(x=>x.delete({timeout: 8000}));
}
client.on('messageReactionAdd', async (reaction,user) => {
    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
    if (reaction.emoji.name == e && 
        reaction.message.reactions.cache.has(e) &&
        reaction.message.reactions.cache.get(e).count == 1) {
            sendAtaturk(reaction.message.channel);
    }
});
client.on('message', async msg => {
    if (msg.author == client.user)
        return;

    if (msg.content == e) {
        sendAtaturk(msg.channel);
        return;
    }

    // arena spawn test
    if (!process.env.DCBOT_NOARENA 
    && (match = msg.content.match(/<:([A-z]+):([0-9]+)>/))
    &&  Math.random() < state.arena.spawn_rate
    ) {
        state.arena.create(Discord, msg, match[1], match[2], 10000);
    }

    if (msg.channel.id == cid_gameserver) {
        
        if (msg.content.length <= 0) 
            return;

        let guild = msg.guild;
        let member = guild.member(msg.author);
        let nickname = member ? member.displayName : msg.author.username;
        sendmsg = `${nickname}: ${msg.content}`;
        console.log(sendmsg);
        ws.send_all(sendmsg);

        //handled channel, return
        return;
    }

        
    // messages send on arena (command or not, doesn't matter)
    if (msg.channel.id == cid_arena && state.arena_toggle) state.arena.toggle_purge(msg);

    // if not command anywhere, return
    if (!parse.is(msg, prefix)) {        
        return;
    }

    // command send on arena
    if (msg.channel.id == cid_arena) {
        if (parse.is(msg, "vur")) {
            state.arena.hit(Discord, msg);
            return;
        }
    }

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
    if (msg.author.id != uid_ockis)
        return;

    if (switch_module("gamemaster", msg, "gm_")) return;
    

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


var ws = {};
module.exports.set_sendallF = (f) => {
    ws.send_all = f;
}
