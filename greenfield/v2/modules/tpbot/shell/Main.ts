import { Message } from "discord.js";
import { Helper } from "../../../common/Helper";
import { TpbotModule } from "../../../TpbotModule";

export class Shell extends TpbotModule
{
/*******************************************************************72*/
protected async directMessage(message: Message)
{
    if (false === Helper.hasShell(message))
        return;

    
}
/*******************************************************************72*/
}