import { Client } from "discord.js";
import { parentPort, workerData } from "worker_threads";
import { Summoner } from "./Summoner";
import { Module } from "./Module";
import { Print } from "./Print";
import { Minion } from "./Minion";
const a = workerData.emit;
class BotManager// extends Summoner
{
    print: Print = new Print(BotManager.name);
    constructor()
    {
        //super(print);
    }
    public login(token: string, intent: number = 32767)
    {
        const client = new Client({intents: [intent]});

        client.on("error", (error) => {
            this.print.error(error);
        });
        client.on("ready", () => {

            if (client.user !== undefined && client.user !== null) {
                Minion.toSummoner(parentPort, "updateMinionName", client.user.tag);
            }
            else {
                this.print.warn("Can't update descriptive name because client.user is either null or undefined");
            }
            this.print.info(`Logged in [${client.user?.tag}]`);
            const m = new Module(client);
        })

        return client.login(token);
    }
    // public Logoff(token: string) { }
}
const print = new Print(BotManager.name);
Minion.fromSummoner(parentPort, "message", print.from("Summoner").info.bind(print));
Minion.fromSummoner(parentPort, "updateSummonerName", print.from("updateSummonerName: ").info.bind(print));
Minion.toSummoner(parentPort, "risen");
new BotManager().login(workerData.token).catch(print.exception);