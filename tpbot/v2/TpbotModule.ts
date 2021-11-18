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
        this.client.on(event, listener.bind(this) as any);
    }
    this.print.info("Super constructor ended");
}
protected abstract textMessage(message: Message): Promise<void>;
protected guild(id: string)
{
    return this.client.guilds.fetch(id);
}
/*******************************************************************72*/
}