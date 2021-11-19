import { Client, ClientEvents, Message } from "discord.js";
import { Print } from "./common/Print";
export abstract class TpbotModule
{
/*******************************************************************72*/
protected readonly print: Print;
constructor(public readonly moduleName: string,
    protected readonly client: Client) 
{ 
    this.print = new Print(moduleName, this.client.user?.tag);
    const pairs: [[keyof ClientEvents, (args: any) => Promise<void>]] = [
        ["messageCreate", this.textMessage],
    ];
    for (const [event, listener] of pairs) {
        //this.client.on(event, (...args) => listener(args));
    }
    this.client.on("messageCreate", (message) => {
        this.print.info(message.content); 
    });
    this.print.info("Super constructor ended");
}
// tslint:disable: no-empty
protected async textMessage(message: Message): Promise<void> { }
// tslint:enable: no-empty
protected guild(id: string)
{
    return this.client.guilds.fetch(id);
}
/*******************************************************************72*/
}