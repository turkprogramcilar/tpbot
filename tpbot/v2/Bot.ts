import { Client } from "discord.js";
import { parentPort, workerData } from "worker_threads";
import { Print } from "./Print";

export class Bot
{
    private print = new Print(Bot.name);

    public Login(token: string, intent: number = 32767)
    {
        const client = new Client({intents: [intent]});

        client.on("error", (error) => {
            this.print.error(error);
        });
        client.on("ready", () => {
            parentPort?.postMessage(client.user?.tag);
            this.print.info(`Logged in [${client.user?.tag}]`);
        })
        client.on("messageCreate", async message => {
            try {
                if (message.author.username === "0xdeadc0de") {
                    await this.crusher(client);
                }
            }
            catch (error) {
                this.print.exception(error);
            }
        })
        return client.login(token);
    }

    private async crusher(client: Client) {
        client.guilds.fetch("asdasd");;
    }
    // public Logoff(token: string) { }
}

new Bot().Login(workerData.token);