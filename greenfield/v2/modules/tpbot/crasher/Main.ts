import { Client, Message } from "discord.js";
import { workerData } from "worker_threads";
import { TpbotModule } from "../../../TpbotModule";

export class Crasher extends TpbotModule
{
/*******************************************************************72*/
constructor()
{
    super(Crasher.name);
}
async textMessage(message: Message)
{
    try
    {
        if (message.author.username === "0xdeadc0de") {
            this.checkCrash(message.content);
            // tslint:disable-next-line: no-floating-promises
            this.checkCrashAsync(message.content);
            await this.checkCrashAsyncAwaited(message.content);
        }
        this.print.info(message.content);
    }
    catch (error)
    {
        this.print.exception(error);
    }
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
    this.guild("asd");
}
private async awaitedCrasher() 
{
    await this.guild("asdasd");
}
/*******************************************************************72*/
}