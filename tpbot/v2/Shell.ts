/*******************************************************************72*/
import { Client } from "discord.js";
import { workerData } from "worker_threads";
import { Print } from "./Print";
import { Crasher } from "./modules/Crasher";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";

// tslint:disable-next-line: no-unused-expression
new class Shell extends MinionFile
{
/*******************************************************************72*/
private print: Print = new Print(Shell.name);
constructor()
{
    super(Shell.name);
    const data: BotData = workerData;
    this.fromSummoner("updateSummonerName", 
        summonerName => { this.print.from(summonerName); });
    this.toSummoner("awaken");
    // following is an auto-login, normally this must be configured
    // or started manually @TODO
    this.login(data.token).catch(this.print.exception);
}
    fromSummoner(arg0: string, arg1: (summonerName: any) => void) {
        throw new Error("Method not implemented.");
    }
    toSummoner(arg0: string) {
        throw new Error("Method not implemented.");
    }
login(token: string, intent: number = 32767)
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
            this.print.warn("Can't update descriptive name because client.user "
            + " is either null or undefined");
        }
        this.print.info(`Logged in [${client.user?.tag}]`);
        // following is an auto-load, normally this must be configured
        // or loaded manually @TODO
        new Crasher(client);
    })

    return client.login(token);
}
// Logoff(token: string) { } @TODO
/*******************************************************************72*/
}();