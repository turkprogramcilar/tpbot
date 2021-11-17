import { Client } from "discord.js";
import { workerData } from "worker_threads";
import { Print } from "./common/Print";
import { Crasher } from "./modules/Crasher";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";
import { Boot } from "./Boot"
import { Module } from "./Module";
import { Summoner } from "./threading/Summoner";
export class ModuleLoader extends MinionFile
{
/*******************************************************************72*/
private readonly client: Client;
private readonly summoner = new Summoner(ModuleLoader.name);
constructor(private readonly token: string,
    private readonly intent: number = Math.pow(2, 15) - 1)
{
    super(ModuleLoader.name);
    this.client = new Client({intents: [this.intent]});

    // following is an auto-login, normally this must be configured
    // or started manually @TODO
    this.login().catch(this.print.exception);
}
private login()
{
    
    // @TODO events here should not be exposed like this. find a better way
    this.client.on("error", (error) => {
        this.print.error(error);
    });
    this.client.on("ready", () => {

        if (this.client.user !== undefined && this.client.user !== null) {
            this.toSummoner("updateMinionName", this.client.user.tag);
            this.print.setSurname(this.client.user.tag);
        }
        else {
            this.print.warn("Can't update descriptive name because client.user "
            + " is either null or undefined");
        }
        this.print.info(`Logged in succesfully.`);

        // @TODO right now only strongly typed module loading is possible
        // and defined below at compile time. how about hot loading feature?
        // if it is required then we woudl have no ways to know about a type.
        // therefore wouldn't be sure about new T(). 
        const moduleDirectory: {[key: string]: (c: Client) => Module} = {
            [Crasher.name]: c => new Crasher(c),
        }
        Boot.getParsedYaml().moduleMapping
            .filter(x => x.tag === this.client.user?.tag)
            .map(x => x.modules.map(y => moduleDirectory[y](this.client)));
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