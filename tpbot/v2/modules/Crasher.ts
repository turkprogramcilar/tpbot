import { Client } from "discord.js";
import { Module } from "../Module";
import { Print } from "../Print";

export class Crasher extends Module
{
    public constructor(client: Client)
    {
        super(client, new Print(Crasher.name));

        client.on("messageCreate", message => {
            
            try
            {
                if (message.author.username === "0xdeadc0de") {
                    this.checkCrash(message.content);
                }
                this.print.info(message.content);
            }
            catch (error)
            {
                this.print.exception(error);
            }
        })
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
}