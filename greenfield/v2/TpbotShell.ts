import { Client, Message } from "discord.js";
import { Helper } from "./common/Helper";
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
private async createSession(message: Message)
{
    const user = message.author.username;
    const id = message.author.id;
    let buffer = "```shell\nAccess granted"
    buffer += this.prompt(user);
    const newMessage = await message.reply(buffer+this.q);
    const pair: [string, Message] = [buffer, newMessage];
    this.sessions[id] = pair;
    return this.sessions[id]
}
private prompt(user: string)
{
    return `\n[${user}@tpbot]$ `;
}
/*******************************************************************72*/
protected async textMessage(message: Message)
{
    if (false === Helper.isRoot(message))
        return;

    const id = message.author.id;
    const user = message.author.username;

    let session = this.sessions[id];
    if (undefined === session) {

        const regex = /ssh\s+(?:root)?<@!?([0-9]+)>/;
        if (!(message.content.match(regex)?.[1] === this.client.user?.id)) 
            return;
        
        session = await this.createSession(message);
        this.sessions[id] = session;
        return;
    }

    let buffer = session[0];
    let shell = session[1];
    buffer += `${message.content}`;
    shell = await shell.edit(buffer+this.q);

    try {
        switch (message.content.substring(0, 4)) {
        case "exit": 
            buffer += `\nGoodbye. . .`; 
            delete this.sessions[id]; 
            await shell.edit(buffer+this.q);
            return;
        case "ping": buffer += `\nPong!`; break;
        case "echo": buffer += `\n${message.content.substring(4)}`; break; 
        default:
            const response = await this.kernelsMinion.request(message.content);
            buffer += `\n${response}`;
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