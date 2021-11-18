import { Client } from "discord.js";
import { workerData } from "worker_threads";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";
import { Boot } from "./Boot"
import { TpbotModule } from "./TpbotModule";
import { Summoner } from "./threading/Summoner";
import { Path } from "./common/Path";
import { TpbotDirectory } from "./TpbotDirectory";
export class TpbotClient extends MinionFile
{
/*******************************************************************72*/
private readonly client: Client;
private readonly summoner = new Summoner(TpbotClient.name);
constructor(private readonly token: string,
    private readonly intent: number = Math.pow(2, 15) - 1)
{
    super(TpbotClient.name);
    this.client = new Client({intents: [this.intent]});
    this.login();
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

        const responsibleModules = Boot.getParsedYaml().tokenMapping
            .filter(x => x.tag === this.client.user?.tag)
            .map(x => x.modules?.tpbot ?? [])
            .flat();

        for (const tpbotModule of responsibleModules) {
            const constructor = TpbotDirectory.getConstructor(tpbotModule);
            if (constructor !== null)
                constructor(this.client);
        }
    })

    return this.client.login(this.token);
}
/*******************************************************************72*/
}
if (workerData !== null) {
    const data: BotData = workerData;
    // tslint:disable-next-line: no-unused-expression
    new TpbotClient(data.token);
}