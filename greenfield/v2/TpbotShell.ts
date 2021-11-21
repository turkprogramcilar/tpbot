import { Client, Message } from "discord.js";
import { Helper as H } from "./common/Helper";
import { MinionFile } from "./threading/MinionFile";
import { TpbotModule } from "./TpbotModule";

export type userId = string;
export class TpbotShell extends TpbotModule
{
/*******************************************************************72*/
private sessions: {[key: userId]: [string, Message]} = {};
private readonly q = "```";
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
    const newMessage = await shell.reply(buffer+this.q);
    const pair: [string, Message] = [buffer, newMessage];
    this.sessions[id] = pair;
}
private async createSession(message: Message)
{
    const user = message.author.username;
    const id = message.author.id;
    const buffer = "```shell\n"
    + `\nAccess granted. Welcome to Tpbot v2`
    + `\n`
    ;
    const shell = await message.reply(buffer+this.q);
        this.sessions[id] = [buffer, shell];
    // get countables

    const append =  
    + `\n${0} total tpbot token${H.ps(0)} ${H.ai(0)}`
        + ` available in the environment.`
    + `\n${0} bot${H.ps(0)} ${H.ai(0)} logged in.`
    + `\n${0} freestyle modules are running`
    + `\n${0} tpbot module${H.ps(0)} ${H.ai(0)} running`
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

    let buffer = session[0];
    let shell = session[1];
    buffer += `${text}`;
    shell = await shell.edit(buffer+this.q);

    try {
        switch (text.substring(0, 4)) {
        case "exit": 
            buffer += `\nGoodbye. . .`; 
            delete this.sessions[id]; 
            await shell.edit(buffer+this.q);
            return;
        case "ping":
            buffer += `\nPong!`;
            break;
        case "sudo":
        case "echo": if (this.hasArg(text, 4)) {
            if (text[0] === 's') {
                const response = 
                    await this.kernelsMinion.request(text.substring(5));
                buffer += `\n${response}`;
            } else {
                buffer += `\n${text.substring(5)}`;
            }
            break;
        }
        // else it falls to default with unknown command
        default: 
            buffer += `\nUnknown command: ${text}`; 
            break; 
        } 
    }
    catch (error) {
        buffer += `\n${error}`
    }
    finally {
        buffer += this.prompt(user);
    }
    shell = await shell.edit(buffer+this.q);
    this.sessions[id] = [buffer, shell];
}
/*******************************************************************72*/
}