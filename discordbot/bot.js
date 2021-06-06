require("./constants.js");
require("./state.js");
const db = require("./phpdb.js")
const arena = require("./arena.js");

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
function  r_arg(msg, regex, f, fe=()=>{}) { regex_arg(msg, f, fe, x=>x, regex); }
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

client.on('message', async msg => {
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

        
    // messages send on arena (command or not, doesn't matter)
    if (msg.channel.id == cid_arena && arenaToggle) arena.toggle_purge(msg);

    // if not command anywhere, return
    if (!command(msg, prefix)) {        
        return;
    }

    // command send on arena
    if (msg.channel.id == cid_arena) {
        if (command(msg, "vur")) {
            arena.hit(Discord, msg);
            return;
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

    db.get_exp(msg.author.id);

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
                    msg.channel.send(`Arena güncelleme sıklığı (sn): ${arena.frequency}`);
                } finally {}
            }
        }
        else if (command(msg, "dmg ")) r_arg(msg, /^[0-9]+/, async n => {
            xp = await db.get_exp(n);
            msg.channel.send(`Exp: ${xp} | Dmg: ${arena.dmg(xp)}`);
        })
        else if (command(msg, "expall")) {
            const Guild = msg.guild;
            const Members = Guild.members.cache.map(member => member.id); // Getting the members and mapping them by ID.
            exps = [];
            const process_text = "Bu biraz zaman alacak... ";
            const process_msg = msg.channel.send(process_text);
            let i = 0;
            const members = await msg.guild.members.fetch(); 
            const mn = members.array().length;
            for (const member of members) {
                if (i % 50 == 0) (await process_msg).edit(process_text+`${i}\\${mn}`);
                i++;
                exps.push({name: member[1].user.username, exp: await db.get_exp(member[0])});
            }
            exps.sort((a, b) => -1*(a.exp - b.exp));
            const table = exps.reduce((a,c)=>a+=`${c.name}: ${c.exp} | `, '');
            (await process_msg).edit('```'+table.substring(0,2000-1-6)+'```');
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
});

client.login(process.env.DCBOT_TOKEN);

var ws = {};
module.exports.set_sendallF = (f) => {
    ws.send_all = f;
}
