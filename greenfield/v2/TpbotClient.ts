import { Client, ClientEvents, ClientOptions, DMChannel, Interaction, Message, TextChannel } from "discord.js";
import { workerData } from "worker_threads";
import { BotData } from "./Kernel";
import { MinionFile } from "./threading/MinionFile";
import { Boot } from "./Boot"
import { TpbotShell } from "./TpbotShell";
import { Helper } from "./common/Helper";
import { Menu, Registrar, Slash, TpbotModule } from "./TpbotModule";
import { Crasher } from "./modules/tpbot/crasher/Main";
import { KartOyunu } from "./modules/tpbot/kartoyunu/Main";
import { Ping } from "./modules/tpbot/ping/Main";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { ContextMenuCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
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
private async login()
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

        await this.autorun();
    });
    return this.client.login(this.token);
}
private async autorun()
{
    if ((Helper.prefixed("TPBOT_SHELL_TAG")?.map(([k, v]) => v ?? "") ?? [])
        .some(x => x === this.client.user?.tag ?? "")) {

        new TpbotShell(this.client.user?.tag ?? "", this);
    }
    const modules = (Boot.getParsedYaml().tokenMapping ?? [])
        .filter(x => x.tag === this.client.user?.tag)
        .map(x => x.modules?.tpbot ?? [])
        .flat()
        .map(x => this.loadModule(x))
        .filter(x => x !== undefined);
        ;

    const allSlashCommands = modules
        .flatMap(x => x!.slashCommands)
        .filter(x => x !== undefined)
        .map(x => new SlashCommandBuilder()
            .setName(Helper.debug(x.name))
            .setDescription(x.description)
            .toJSON())
        ;

    const allMenuCommands = modules
        .flatMap(x => x!.menuCommands)
        .filter(x => x !== undefined)
        .map(x => new ContextMenuCommandBuilder()
            .setName(Helper.debug(x.name))
            .setType(x.type)
            .toJSON())
        ;

    const gids = (await this.client.guilds.fetch()).map(x => x.id);
    await this.registerCommands(allSlashCommands.concat(allMenuCommands), gids);
}
private async registerCommands(jsons: any, gid: string[])
{
    const rest = new REST({version: "9"}).setToken(this.token);
    await Promise.all(gid.map(x => rest.put(Routes.applicationGuildCommands(
        this.client.user!.id, x), {body: jsons})));
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

        ["messageCreate", async (message: Message) => {

            const chan = message.channel;
            if (chan instanceof TextChannel) 
                return await module.commandProxy(message);

            if (chan instanceof DMChannel)
                return await module.directMessage(message);

            return Promise.resolve();
        }],

        ["interactionCreate", module.interactionProxy.bind(module)]
    ];
    for (const [event, listener] of pairs) {
        this.client.on(event, listener.bind(this));
    }

    return module;
}
/*******************************************************************72*/
}
if (workerData !== null) {
    const data: BotData = workerData;
    // tslint:disable-next-line: no-unused-expression
    new TpbotClient(data.token);
}