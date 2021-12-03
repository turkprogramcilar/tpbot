import { blockQuote, codeBlock, inlineCode } from "@discordjs/builders";
import { Client, CommandInteraction, ContextMenuInteraction, Interaction, Message } from "discord.js";
import { MessageCommand, UserCommand, PlainCommand, RegexCommand, SlashCommand } from "../../../TpbotDecorators";
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
@PlainCommand async test(message: Message)
{
    return message.reply("OK");
}
@RegexCommand(/([0-9]+)\s*\+\s*([0-9]+)/)
async sum(message: Message, match: RegExpMatchArray)
{
    return message.reply(
        match.slice(1).map(Number).reduce((a,c)=>a+=c,0).toString())
}
@SlashCommand("Pong diye cevap verir.")
ping(interaction: CommandInteraction)
{
    return interaction.reply("TpbotModule Taksim Komut Pong!");
}
@MessageCommand
pingOnMessage(interaction: ContextMenuInteraction)
{
    // @TODO hardcoded see https://github.com/discordjs/discord.js/pull/7003
    const message = interaction.options.getMessage('message')!;
    return interaction.reply("TpbotModule Mesaj üstü Pong! Mesaj: "
        + codeBlock(`${message.content}`));
}
@UserCommand
pingOnUser(interaction: ContextMenuInteraction)
{
    // @TODO hardcoded see https://github.com/discordjs/discord.js/pull/7003
    const user = interaction.options.getUser('user')!;
    return interaction.reply("TpbotModule Kullanıcı üstü Pong! Kullanıcı: "
        + inlineCode(`${user.username}`));
}
/*******************************************************************72*/
}