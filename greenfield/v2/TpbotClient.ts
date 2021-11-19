import { Client, ClientOptions } from "discord.js";
import { workerData } from "worker_threads";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";
import { Boot } from "./Boot"
import { TpbotFactory } from "./TpbotFactory";
import { TpbotShell } from "./TpbotShell";
export class TpbotClient extends MinionFile
{
/*******************************************************************72*/
private readonly client: Client;
constructor(private readonly token: string)
{
    super(TpbotClient.name);

    const options: ClientOptions = {
        intents: [32767], 
        partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
    };
    this.client = new Client(options);
    this.login();
}
private login()
{
    
    // @TODO events here should not be exposed like this. find a better way
    this.client.on("error", (error) => {
        this.print.error(error);
    });
    this.client.on("ready", async () => {

        if (this.client.user !== undefined && this.client.user !== null) {
            this.toSummoner("updateMinionName", this.client.user.tag);
            this.print.setSurname(this.client.user.tag);
        }
        else {
            this.print.warn("Can't update descriptive name because client.user "
            + " is either null or undefined");
        }
        this.print.info(`Logged in succesfully.`
            + ` [guilds=${(await this.client.guilds.fetch()).map(x => x.name)
                .join(", ")}]`);

        if ((Boot.getParsedYaml().shellBots ?? [])
            .some(x => x === this.client.user?.tag ?? "")) {

            new TpbotShell(this.client, this);
            return;
        }
        (Boot.getParsedYaml().tokenMapping ?? [])
            .filter(x => x.tag === this.client.user?.tag)
            .map(x => x.modules?.tpbot ?? [])
            .flat()
            .forEach(x => TpbotFactory.instantiate(x, this.client));
    });
    return this.client.login(this.token);
}
/*******************************************************************72*/
}
if (workerData !== null) {
    const data: BotData = workerData;
    // tslint:disable-next-line: no-unused-expression
    new TpbotClient(data.token);
}