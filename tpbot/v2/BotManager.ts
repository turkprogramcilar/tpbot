import { Client } from "discord.js";
import { parentPort, workerData } from "worker_threads";
import { Summoner } from "./Summoner";
import { Module } from "./Module";
import { Print } from "./Print";
import { Minion } from "./Minion";
import { Crasher } from "./modules/Crasher";
// tslint:disable-next-line: no-unused-expression
new class BotManager
{
    print: Print = new Print(BotManager.name);
    constructor()
    {
        Minion.fromSummoner(parentPort, "message", this.print.from("Summoner").info.bind(this.print));
        Minion.fromSummoner(parentPort, "updateSummonerName", this.print.from("updateSummonerName: ").info.bind(this.print));
        Minion.toSummoner(parentPort, "risen");

        // following is an auto-login, normally this must be configured
        // or started manually @TODO
        this.login(workerData.token).catch(this.print.exception);
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
            // following is an auto-load, normally this must be configured
            // or loaded manually @TODO
            new Crasher(client);
        })

        return client.login(token);
    }
    // public Logoff(token: string) { }
}();