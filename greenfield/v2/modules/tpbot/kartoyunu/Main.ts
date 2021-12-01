import { Client, Message } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";

export class KartOyunu extends TpbotModule
{
/*******************************************************************72*/
constructor()
{
    super(KartOyunu.name);
}
async textMessage(message: Message)
{
    if (message.content === "%ping")
        await message.reply("Pong!");
}
/*******************************************************************72*/
}