import { Client } from "discord.js";
import { workerData } from "worker_threads";
import { Print } from "./common/Print";
import { Crasher } from "./modules/Crasher";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";
import { worker } from "cluster";
export class ModuleLoader extends MinionFile
{
/*******************************************************************72*/
private print: Print = new Print(ModuleLoader.name);
private client: Client;
constructor(private readonly token: string,
    private readonly intent: number = Math.pow(2, 15) - 1)
{
    super(ModuleLoader.name);
    this.client = new Client({intents: [this.intent]});

    this.fromSummoner("updateSummonerName", 
        summonerName => { this.print.from(summonerName); });
    this.toSummoner("awaken");
    // following is an auto-login, normally this must be configured
    // or started manually @TODO
    this.login().catch(this.print.exception);
}
login()
{
    
    this.client.on("error", (error) => {
        this.print.error(error);
    });
    this.client.on("ready", () => {

        if (this.client.user !== undefined && this.client.user !== null) {
            this.toSummoner("updateMinionName", this.client.user.tag);
        }
        else {
            this.print.warn("Can't update descriptive name because client.user "
            + " is either null or undefined");
        }
        this.print.info(`Logged in [${this.client.user?.tag}]`);
        // following is an auto-load, normally this must be configured
        // or loaded manually @TODO
        new Crasher(this.client);
    })

    return this.client.login(this.token);
}
// Logoff(token: string) { } @TODO
/*******************************************************************72*/
}
if (workerData !== null) {
    const data: BotData = workerData;
    // tslint:disable-next-line: no-unused-expression
    new ModuleLoader(data.token);
}