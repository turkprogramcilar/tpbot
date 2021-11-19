const { Client }  = require("discord.js");
const path = require("path");

const options = {
    intents: [32767], 
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
};
const client = new Client(options);
client.on("messageCreate", (message) => {

    if (!message.channel.isText())
        return;
    
    if (message.content === "%ping")
        message.reply("pong! " + path.basename(__filename))
            .catch((error) => console.error(error));
});
// define your token as environment variable
const token = process.env.FREE_TOKEN_PING;
client.login(token);