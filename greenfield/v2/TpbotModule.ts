import { Client, ClientEvents, DMChannel, Message, TextChannel, User } from "discord.js";
import { Boot } from "./Boot";
import { Print } from "./common/Print";
export abstract class TpbotModule
{
/*******************************************************************72*/
protected readonly print: Print;
private client?: Client;
private commands?: [RegExp, 
    (message: Message, m: RegExpMatchArray) => Promise<void> | void, RegExp][];
constructor(public readonly moduleName: string) 
{ 
    this.print = new Print(moduleName);
    this.print.info("Super constructor ended");
}
setTag(name: string)
{
    this.print.setSurname(name);
}
setClient(client: Client)
{
    this.client = client;
}
registerCommand(regexp: RegExp, 
    command: (message: Message, m: RegExpMatchArray) => Promise<void> | void, 
    prefix = /^\$\s*/)
{
    if (!this.commands)
        this.commands = [];
    this.commands.push([regexp, command, prefix]);
}
/*******************************************************************72*/
async commandProxy(message: Message): Promise<void> 
{ 
    for (const [regex, command, prefix] of this.commands ?? []) {
        if (!message.content.match(prefix))
            continue;
        const temp = message.content.replace(prefix, "");
        const m = temp.match(regex);
        if (m) {
            try {
                await command.bind(this)(message, m);
            }
            catch (error) {
                this.print.exception(error);
            }
            break;
        }
    }
    await this.textMessage(message);
}
// tslint:disable: no-empty
async textMessage(message: Message): Promise<void> { }
async directMessage(message: Message): Promise<void> { }
// tslint:enable: no-empty
/*******************************************************************72*/
protected async guilds()
{
    return (await this.client!.guilds.fetch()).map(x => x);   
}
protected async guild(id: string)
{
    return await this.client!.guilds.fetch(id);
}
/*******************************************************************72*/
}