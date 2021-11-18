const { Client }  = require("discord.js");
const path = require("path");

const intent = Math.pow(2, 15) - 1;
const client = new Client({intents: [intent]});
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