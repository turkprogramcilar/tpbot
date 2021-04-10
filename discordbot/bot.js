require("./constants.js");

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // marquee status, this also prevents heroku dyno from sleeping
    let   mi = 0;  // marquee index
    const mw = 32; // marquee window span
    const mm = msg_status;
    const ml = mm.length;
    let marqueeStatus = () =>
        mw >= ml ? mm
        : mi + mw < ml ? mm.slice(mi, ++mi + mw)
        : mi != ml ? mm.slice(mi, ml) + mm.slice(0, mw - ml + ++mi)
        : (mi = 0) | true ? mm.slice(mi, ++mi + mw) : "";

    setInterval(() => { client.user.setActivity(marqueeStatus()); }, 2000);
});

let prefix = "%";

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
    if (!command(msg, "%"))
        return;

    if (command(msg, "echo")) {
        if (msg.content.length>0)
            msg.channel.send(msg.content);
    }


    // beyond is administrative, if not admin return
    if (msg.author.id != uid_ockis)
        return;

    // beyond is admin + fix prefix,
    if (!command(msg, "fix"))
        return;

    // syncs channel permssions with categories belonging caid_fix in constants
    if (command(msg, "sync")) {
        // print all categories
        msg.guild.channels.cache.each(x=>{
            
            if (x.type == "category") {
                console.log(`${x.name} ${x.id}`);
            }
            else if (x.type == "text" && caid_fix.includes(parseInt(x.parentID))) {
                x.lockPermissions()
                    .then(() => console.log('Successfully synchronized permissions with parent channel'))
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