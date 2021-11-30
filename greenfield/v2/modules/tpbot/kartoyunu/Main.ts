import { Client, Message } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";

export class KartOyunu extends TpbotModule
{
/*******************************************************************72*/
constructor(client: Client)
{
    super(KartOyunu.name, client);
}
protected async textMessage(message: Message)
{
    if (message.content === "%ping")
        await message.reply("Pong!");
}
/*******************************************************************72*/
}