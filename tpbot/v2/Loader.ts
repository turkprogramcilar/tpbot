import { Client } from "discord.js";
import { parentPort, workerData } from "worker_threads";
import { Print } from "./Print";
import { Minion } from "./Minion";
import { Crasher } from "./modules/Crasher";
import { BotData } from "./Kernel";
import { MinionFile } from "./MinionFile";

// tslint:disable-next-line: no-unused-expression
new class Loader extends MinionFile
{
    print: Print = new Print(Loader.name);
    constructor()
    {
        super(Loader.name);
        const data: BotData = workerData;
        this.fromSummoner("message", this.print.info.bind(this.print));
        this.fromSummoner("updateSummonerName", summonerName => { this.print.from(summonerName); });
        this.toSummoner("awaken");
        // following is an auto-login, normally this must be configured
        // or started manually @TODO
        this.login(data.token).catch(this.print.exception);
    }
    public login(token: string, intent: number = 32767)
    {
        const client = new Client({intents: [intent]});

        client.on("error", (error) => {
            this.print.error(error);
        });
        client.on("ready", () => {

            if (client.user !== undefined && client.user !== null) {
                this.toSummoner("updateMinionName", client.user.tag);
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