import { Client, Message } from "discord.js";
import { Helper } from "../../../common/Helper";
import { TpbotModule } from "../../../TpbotModule";

export class Shell extends TpbotModule
{
/*******************************************************************72*/
constructor(client: Client)
{
    super(Shell.name, client);
}
protected async directMessage(message: Message)
{
    if (false === Helper.hasShell(message))
        return;

    await message.reply("Access granted");
}
/*******************************************************************72*/
}