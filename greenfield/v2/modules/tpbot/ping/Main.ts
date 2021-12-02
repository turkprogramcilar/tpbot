import { Client, Message } from "discord.js";
import { prefixed, regex } from "../../../TpbotDecorators";
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
@prefixed async test(message: Message)
{
    return message.reply("OK");
}
@regex(/([0-9]+)\s*\+\s*([0-9]+)/)
async sum(message: Message, match: RegExpMatchArray)
{
    return message.reply(match.slice(1).map(Number).reduce((a,c)=>a+=c,0).toString())
}
/*******************************************************************72*/
}