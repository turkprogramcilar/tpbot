import { Client } from "discord.js";
import { parentPort, workerData } from "worker_threads";
import { Summoner } from "./Manager";
import { Module } from "./Module";
import { Print } from "./Print";
import { Minion } from "./Subordinate";
const a = workerData.emit;
class BotManager// extends Summoner
{
    print: Print = new Print(BotManager.name);
    constructor()
    {
        //super(print);
    }
    public Login(token: string, intent: number = 32767)
    {
        const client = new Client({intents: [intent]});

        client.on("error", (error) => {
            this.print.Error(error);
        });
        client.on("ready", () => {

            if (client.user !== undefined && client.user !== null) {
                // process.emit("updateDescriptiveName", client.user.tag);
            }
            else {
                this.print.Warn("Can't update descriptive name because client.user is either null or undefined");
            }
            this.print.Info(`Logged in [${client.user?.tag}]`);
            const m = new Module(client);
        })

        return client.login(token);
    }
    // public Logoff(token: string) { }
}
const print = new Print(BotManager.name);
Minion.fromSummoner(parentPort, "message", print.Info.bind(print));
Minion.toSummoner(parentPort, "message", "Ping");
new BotManager().Login(workerData.token).catch(print.Exception);