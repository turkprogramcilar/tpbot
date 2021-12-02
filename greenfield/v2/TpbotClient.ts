import { Client, ClientEvents, ClientOptions, DMChannel, Message, TextChannel } from "discord.js";
import { workerData } from "worker_threads";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";
import { Boot } from "./Boot"
import { TpbotShell } from "./TpbotShell";
import { Helper } from "./common/Helper";
import { TpbotModule } from "./TpbotModule";
import { Crasher } from "./modules/tpbot/crasher/Main";
import { KartOyunu } from "./modules/tpbot/kartoyunu/Main";
import { Ping } from "./modules/tpbot/ping/Main";
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

        this.autorun();
    });
    return this.client.login(this.token);
}
private autorun()
{
    if ((Helper.prefixed("TPBOT_SHELL_TAG")?.map(([k, v]) => v ?? "") ?? [])
        .some(x => x === this.client.user?.tag ?? "")) {

        new TpbotShell(this.client.user?.tag ?? "", this);
    }
    const modules = (Boot.getParsedYaml().tokenMapping ?? [])
        .filter(x => x.tag === this.client.user?.tag)
        .map(x => x.modules?.tpbot ?? [])
        .flat()
        .forEach(this.loadModule.bind(this))
        ;
}
private loadModule(name: string)
{
    let module: TpbotModule;
    switch(name) {
    case Crasher.name:   module = new Crasher();       break;
    case Ping.name:      module = new Ping();          break;
    case KartOyunu.name: module = new KartOyunu();     break;
    default:
        this.print.error(`${name} TpbotModule is not registered in load system`);
        return;
    }

    if (this.client.user)
        module.setTag(this.client.user.tag);

    module.setClient(this.client);

    const pairs: [keyof ClientEvents, any][] = [ // @TODO make this type-safe
        ["messageCreate", (message: Message) => {
            const chan = message.channel;
            if (chan instanceof TextChannel) return module.commandProxy(message);
            if (chan instanceof DMChannel)   return module.directMessage(message);
            return Promise.resolve();
        }],
    ];
    for (const [event, listener] of pairs) {
        this.client.on(event, listener.bind(this));
    }
}
/*******************************************************************72*/
}
if (workerData !== null) {
    const data: BotData = workerData;
    // tslint:disable-next-line: no-unused-expression
    new TpbotClient(data.token);
}