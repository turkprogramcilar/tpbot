/*******************************************************************72*/
import { Client } from "discord.js";
import { Module } from "../Module";
import { Print } from "../Print";

export class Crasher extends Module
{
/*******************************************************************72*/
constructor(client: Client)
{
    super(client, new Print(Crasher.name));

    client.on("messageCreate", async message => {
        
        try
        {
            if (message.author.username === "0xdeadc0de") {
                this.checkCrash(message.content);
                this.checkCrashAsync(message.content);
                await this.checkCrashAsyncAwaited(message.content);
            }
            this.print.info(message.content);
        }
        catch (error)
        {
            this.print.exception(error);
        }
    })
}
private async checkCrashAsyncAwaited(message: string)
{
    switch(message)
    {
        case "aacc": this.crasher(); break;
        // tslint:disable-next-line: no-floating-promises
        case "aacw": this.awaitedCrasher(); break;
    }
}
private async checkCrashAsync(message: string)
{
    switch(message)
    {
        case "acc": this.crasher(); break;
        // tslint:disable-next-line: no-floating-promises
        case "acw": this.awaitedCrasher(); break;
    }
}
private checkCrash(message: string)
{
    switch(message)
    {
        case "cc": this.crasher(); break;
        // tslint:disable-next-line: no-floating-promises
        case "cw": this.awaitedCrasher(); break;
    }
}
private crasher() 
{
    // tslint:disable-next-line: no-floating-promises
    this.client.guilds.fetch("asdasd");
}
private async awaitedCrasher() 
{
    await this.client.guilds.fetch("asdasd");
}
/*******************************************************************72*/
}