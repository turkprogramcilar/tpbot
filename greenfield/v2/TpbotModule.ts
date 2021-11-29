import { Client, ClientEvents, DMChannel, Message, TextChannel, User } from "discord.js";
import { Boot } from "./Boot";
import { Print } from "./common/Print";
export abstract class TpbotModule
{
/*******************************************************************72*/
protected readonly print: Print;
constructor(public readonly moduleName: string,
    protected readonly client: Client) 
{ 
    this.print = new Print(moduleName, this.client.user?.tag);
    const pairs: [keyof ClientEvents, any][] = [ // @TODO make this type-safe
        ["messageCreate", (message: Message) => {
            const chan = message.channel;
            if (chan instanceof TextChannel) return this.textMessage(message);
            if (chan instanceof DMChannel) return this.directMessage(message);
            return Promise.resolve();
        }],
    ];
    for (const [event, listener] of pairs) {
        this.client.on(event, listener.bind(this));
    }
    this.print.info("Super constructor ended");
}
/*******************************************************************72*/
// tslint:disable: no-empty
protected async textMessage(message: Message): Promise<void> { }
protected async directMessage(message: Message): Promise<void> { }
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