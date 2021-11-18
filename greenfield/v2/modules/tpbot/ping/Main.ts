import { Message } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";

export class Ping extends TpbotModule
{
/*******************************************************************72*/
protected async textMessage(message: Message)
{
    if (message.content === "%ping")
        await message.reply("Pong!");
}
/*******************************************************************72*/
}