import { Client, ClientOptions } from "discord.js";
import path from "path";

const options: ClientOptions = {
    intents: [32767], 
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
};
const client = new Client(options);
client.on("messageCreate", async (message) => {

    if (!message.channel.isText())
        return;
    
    try {
        if (message.content === "%ping")
            await message.reply("pong! " + path.basename(__filename));
    }
    catch (error) {
        // tslint:disable-next-line: no-console
        console.error(error);
    }
});
// define your token as environment variable
const token = process.env.FREE_TOKEN_PING;
// tslint:disable-next-line: no-console
client.login(token).catch(x => console.error(x));