require("./constants.js");

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author == client.user)
        return;

    if (msg.channel.id == cid_gameserver) {
        
        if (msg.content.length <= 0) 
            return;

        let guild = msg.guild;
        let member = guild.member(msg.author);
        let nickname = member ? member.displayName : msg.author.username;
        console.log(nickname);
        send_all(`${nickname}: ${msg.content}`)
    }

    else if (msg.content === '%ping') {
        msg.reply('Pong!');
    }
});

client.login('ODIwNzE3ODcwMjcwMjUxMDI5.YE5PFA.ryq3CBLWM7-nIzMfyPXMFGEWar4');

var send_all;
module.exports.set_sendallF = (f) => {
    send_all = f;
}