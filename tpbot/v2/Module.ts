import { Client } from "discord.js";
import { Print } from "./Print";



export class Module
{
    private print = new Print(Module.name);

    public constructor(client: Client)
    {
        client.on("ready", () => {
            this.print.info(`Logged2 in [${client.user?.tag}]`);
        })
        client.on("ready", () => {
            this.print.info(`Logged3 in [${client.user?.tag}]`);
        })
        client.on("messageCreate", async message => {
            try {
                if (message.author.username === "0xdeadc0de") {
                    this.print.info(message.content);
                    await this.crusher(client);
                }
            }
            catch (error) {
                this.print.exception(error);
            }
        })
    }
    private async crusher(client: Client) {
        client.guilds.fetch("asdasd");;
    }
}