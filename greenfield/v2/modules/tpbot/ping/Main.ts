import { Client, Message } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";

export class Ping extends TpbotModule
{
/*******************************************************************72*/
constructor()
{
    super(Ping.name);
}
async textMessage(message: Message)
{
    if (message.content === "%ping")
        await message.reply("Pong!");
}
/*******************************************************************72*/
}