require("./constants.js");

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let prefix = "%";

/**
 * @param {Discord.Message} msg
 * @param {string} cmd
 */
function command(msg, cmd) {
    if (msg.content.startsWith(prefix+cmd)) {
        msg.content = msg.content.slice(cmd.length+prefix.length);
        return true;
    }
    return false;
}

client.on('message', msg => {
    if (msg.author == client.user)
        return;

    if (msg.channel.id == cid_gameserver) {
        
        if (msg.content.length <= 0) 
            return;

        let guild = msg.guild;
        let member = guild.member(msg.author);
        let nickname = member ? member.displayName : msg.author.username;
        sendmsg = `${nickname}: ${msg.content}`;
        console.log(sendmsg);
        ws.send_all(sendmsg);
    }

    else if (command(msg, "echo")) {
        msg.reply(msg.content);
    }
});

client.login('ODIwNzE3ODcwMjcwMjUxMDI5.YE5PFA.ryq3CBLWM7-nIzMfyPXMFGEWar4');

var ws = {};
module.exports.set_sendallF = (f) => {
    ws.send_all = f;
}