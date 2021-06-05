require("./constants.js");
require("./state.js");
let arena = require("./arena.js");

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // prevent marquee timer from toggling more than once
    if (marqueeTimer)
        return;
    // marquee status, this also prevents heroku dyno from sleeping
    let   mi = 0;  // marquee index
    const mm = msg_status;
    const ml = mm.length;
    const marqueeStatus = () =>
        mi != ml-1 ? mm[++mi]
                   : mm[mi=0];

    const setStatus = () => client.user.setActivity(marqueeStatus());
    setStatus();
    marqueeTimer = setInterval(setStatus, 10000*(1+Math.random()));
});

let prefix = "%";

function regex_arg(msg, f, f_else, fr, regex) {
    r = msg.content.trimStart().match(regex); if (r) {
        msg.content = msg.content.trimStart().slice(r[0].length);
        f(fr.call(null, r[0]));
    } else {
        f_else();
    }
}
function ui_arg(msg, f, fe=()=>{}) { regex_arg(msg, f, fe, parseInt, /^[0-9]+/); }
function  i_arg(msg, f, fe=()=>{}) { regex_arg(msg, f, fe, parseInt, /^[+-][0-9]+?/); }
function  f_arg(msg, f, fe=()=>{}) { regex_arg(msg, f, fe, parseFloat, /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/); }

/**
 * @param {Discord.Message} msg
 * @param {string} cmd
 */
function command(msg, cmd) {
    if (msg.content.trimStart().startsWith(cmd)) {
        msg.content = msg.content.trimStart().slice(cmd.length);
        return true;
    }
    return false;
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

client.on('message', msg => {
    if (msg.author == client.user)
        return;

    if (msg.content == e) {
        sendAtaturk(msg.channel);
        return;
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

        

    // if not command anywhere, return
    if (!command(msg, prefix)) {        
        // messages send on arena (not commands)
        if (msg.channel.id == cid_arena) msg.delete();
        return;
    }

    // command send on arena
    if (msg.channel.id == cid_arena) {
        if (command(msg, "vur")) {
            arena.hit(Discord, msg);
        }
        else {
            if (arenaToggle) msg.delete();
        }
    }

    if (command(msg, "echo")) {
        if (msg.content.length>0)
            msg.channel.send(msg.content);
        return;
    }


    // beyond is administrative or feature previews only, 
    // if not admin return
    if (msg.author.id != uid_ockis)
        return;

    if (command(msg, "gm_")) {
        
        if (command(msg, "arena")) {
            arenaToggle = !arenaToggle;
            msg.channel.send(`Arenaya atilan tum mesajlari sil: ${arenaToggle}`);
        }
        else if (command(msg, "buff")) { f_arg(msg, f => {
            arena.buff = f;
            msg.channel.send(`Arena hasar oranını düzenle: ${f}`);
        })}
        else if (command(msg, "vur ")) {
            if (isNaN(msg)==false) {
                try {
                    arena.hit(Discord, msg, true, parseInt(msg));
                } finally {}
            }
        }
        else if (command(msg, "yarat ")) {
            r = msg.content.match(/<:([A-z]+):([0-9]+)>\s*([0-9]+)/)
            if (r) {
                id=r[2]; nm=r[1]; hp=parseInt(r[3]);
                if (!msg.guild.emojis.cache.get(id)) return;
                arena.create(Discord, msg, nm, id, hp)
            }
        }
        else if (command(msg, "frekans ")) {
            if (isNaN(msg)==false) {
                try {
                    arena.frequency = parseInt(msg)
                } finally {}
            }
        }
        // unknown gm_ command, return
        return;
    }
    

    // beyond is admin + fix prefix,
    if (!command(msg, "fix"))
        return;

    // syncs channel permssions with categories belonging caid_fix in constants
    if (command(msg, "sync")) {
        // print all categories
        msg.guild.channels.cache.each(x=>{
            if (x.type == "text" && x.parent) {
                x.lockPermissions()
                    .then(() => console.log('Successfully synchronized permissions with parent channel'+`${x.parent.name}->${x.name}`))
                    .catch(console.error);
            }
        });
    }
    else if (command(msg, "role")) {
        

    }
});

client.login(process.env.DCBOT_TOKEN);

var ws = {};
module.exports.set_sendallF = (f) => {
    ws.send_all = f;
}
