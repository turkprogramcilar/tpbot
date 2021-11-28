import { Client, Message } from "discord.js";
import { Helper as H, Helper } from "./common/Helper";
import { MinionFile } from "./threading/MinionFile";
import { TpbotModule } from "./TpbotModule";

export type userId = string;
export class TpbotShell extends TpbotModule
{
/*******************************************************************72*/
private sessions: {[key: userId]: [string, Message]} = {};
private readonly shellEnd = "```";
private readonly shellHead = "```shell\n"
constructor(client: Client, private kernelsMinion: MinionFile)
{
    super(TpbotShell.name, client);
}
private async updateTerminal(id: userId, append: string)
{
    let [buffer, shell] = this.sessions[id];
    if (buffer === undefined || shell === undefined) {
        this.print.error("Critical error! Session is empty when update"
            + "Terminal method is called.");
        return;
    }
    buffer += append;

    const newMessage = (buffer+this.shellEnd).length < 2000
        ? await shell.edit(buffer+this.shellEnd)
        : (this.shellHead+append+this.shellEnd).length < 2000
            ? await shell.reply(this.shellHead+append+this.shellEnd)
            : await shell.reply("Output is too long to append. We need"
                + " split mechanism ASAAP @DEVELOPERS @TODO")
        ;
    const pair: [string, Message] = [
        newMessage.content.slice(0, -this.shellEnd.length),
        newMessage];
    this.sessions[id] = pair;
}
private async createSession(message: Message)
{
    const user = message.author.username;
    const id = message.author.id;
    const buffer = this.shellHead
    + `\nAccess granted. Welcome to Tpbot v2`
    + `\n`
    ;
    const shell = await message.reply(buffer+this.shellEnd);
        this.sessions[id] = [buffer, shell];

    const tokens = await this.kernelsMinion.request("ls tokens");
    const tn = tokens.split("\n").length - 1;
    const append = ""
    + `\n${tn} total tpbot token${H.ps(tn)} ${H.ai(tn)}`
        + ` available in the environment.`
    + `\n${-1} bot${H.ps(0)} ${H.ai(0)} logged in.`
    + `\n${-1} freestyle modules are running`
    // + `\n${tn} tpbot module${H.ps(tn)} ${H.ai(tn)} running`
    + this.prompt(user);
    await this.updateTerminal(id, append);
    return this.sessions[id]
}
private prompt(user: string)
{
    return `\n[${user}@tpbot]$ `;
}
private hasArg(text: string, length: number)
{
    return text.length > length && text[length].match(/\s/);
}
/*******************************************************************72*/
protected async textMessage(message: Message)
{
    if (false === H.isRoot(message))
        return;

    const id = message.author.id;
    const user = message.author.username;
    const text = message.content;

    const session = this.sessions[id];
    if (undefined === session) {

        const regex = /ssh\s+(?:root)?<@!?([0-9]+)>/;
        if (!(text.match(regex)?.[1] === this.client.user?.id)) 
            return;
        
        await this.createSession(message);
        return;
    }

    await this.updateTerminal(id, text);
    let append = "";

    try {
        switch (text.substring(0, 4)) {
        case "exit": 
            append += `\nGoodbye. . .`; 
            await this.updateTerminal(id, append);
            delete this.sessions[id]; 
            return;
        case "ping":
            append += `\nPong!`;
            break;
        case "sudo":
        case "echo": if (this.hasArg(text, 4)) {
            if (text[0] === 's') {
                const response = 
                    await this.kernelsMinion.request(text.substring(5));
                append += `\n${response}`;
            } else {
                append += `\n${text.substring(5)}`;
            }
            break;
        }
        // else it falls to default with unknown command
        default: 
            append += `\nUnknown command: ${text}`; 
            break; 
        } 
    }
    catch (error) {
        append += `\n${error}`
    }
    finally {
        append += this.prompt(user);
    }
    await this.updateTerminal(id, append);
}
/*******************************************************************72*/
}