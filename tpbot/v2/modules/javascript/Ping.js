import { Client } from "discord.js";

const intent = Math.pow(2, 15) - 1;
const client = new Client({intents: [intent]});
client.on("messageCreate", (message) => {

    if (!message.channel.isText())
        return;
    
    if (message.content === "%ping")
        await message.reply("pong!");
});
// define your token as environment variable TPBOT_TOKEN_PING
const token = process.env.TPBOT_TOKEN_PING;
client.login(token);