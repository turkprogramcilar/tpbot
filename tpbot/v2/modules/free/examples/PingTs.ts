import { Client } from "discord.js";

const intent = Math.pow(2, 15) - 1;
const client = new Client({intents: [intent]});
client.on("messageCreate", async (message) => {

    if (!message.channel.isText())
        return;
    
    try {
        if (message.content === "%ping")
            await message.reply("pong!");
    }
    catch (error) {
        // tslint:disable-next-line: no-console
        console.error(error);
    }
});
// define your token as environment variable TPBOT_TOKEN_PING
const token = process.env.TPBOT_TOKEN_PING;
// tslint:disable-next-line: no-console
client.login(token).catch(x => console.error(x));