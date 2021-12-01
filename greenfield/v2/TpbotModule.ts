import { Client, ClientEvents, DMChannel, Message, TextChannel, User } from "discord.js";
import { Boot } from "./Boot";
import { Print } from "./common/Print";
export abstract class TpbotModule
{
/*******************************************************************72*/
protected readonly print: Print;
constructor(public readonly moduleName: string) 
{ 
    this.print = new Print(moduleName);
    this.print.info("Super constructor ended");
}
setTag(name: string)
{
    this.print.setSurname(name);
}
/*******************************************************************72*/
// tslint:disable: no-empty
async textMessage(message: Message): Promise<void> { }
async directMessage(message: Message): Promise<void> { }
// tslint:enable: no-empty
/*******************************************************************72*/
protected async guilds()
{
    return (await this.client.guilds.fetch()).map(x => x);   
}
protected async guild(id: string)
{
    return await this.client.guilds.fetch(id);
}
/*******************************************************************72*/
}