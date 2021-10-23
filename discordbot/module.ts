// package imports
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { assert } from "console";
import { channel } from "diagnostic_channel";
import { Message, Client, User, PartialUser, MessageReaction, Presence, GuildManager, Guild, GuildChannel, TextChannel, Interaction, CommandInteraction, Collection, ApplicationCommandData, ApplicationCommandPermissionData } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionTypes, ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { log } from './log';
// local imports
const db        = require("../../discordbot/mongodb");
const tools     = require("../../discordbot/tools");
const parser    = require("../../discordbot/cmdparser");
const constants = require("../../discordbot/constants");

/**
 * 
    if (fetch_start) return await parser.send_uwarn(msg,
        "Modul halen yukleniyor... Lutfen bir sure sonra tekrar deneyin.");
 */

export type user_state_value = string | number | boolean | undefined;
export type module_user_state = {[key : string] : user_state_value};

interface CommandModule {
    data : SlashCommandBuilder,
    execute : (interaction : CommandInteraction) => Promise<void>,
    permissions : ApplicationCommandPermissionData[] | undefined,
};

const UNNAMED_MODULE : string = "unnamed_module";
// module state users for dc users
const MS_DCUSERS : string = "dcusers";
const MS_BULK : string = "bulkmessages";
const FORBIDDEN_KEYS : string[] = [MS_DCUSERS, MS_BULK];

export class dcmodule {
    // some constants
    static readonly guild_id_tp         : string = constants.sid.tpdc;
    static readonly role_id_kidemli     : string = constants.rid.kidemli;
    static readonly role_id_hosgeldiniz : string = constants.rid.hosgeldiniz;

    // fields
    protected commands = new Collection<string, CommandModule>();
    protected db_fetch_start : Date | undefined = new Date();
    protected state: any;
    private promises_module_state_queue : Promise<void>[] = [];

    // public readonly fields
    public readonly log = new log(this.module_name);
    // ctor
    constructor(
        protected module_name : string = UNNAMED_MODULE, 
        protected administative_commands : boolean = false) { }
    
    // props
    public get_client() : Client { 
        return this.state.client; 
    }

    public fetch_user(user_id : string) { 
        return this.get_client().users.fetch(user_id);
    }
    public fetch_guild_member(guild : Guild, user_id : string) { 
        return guild.members.cache.get(user_id);
    }
    public async on_event(evt: string, args: any) {

        switch(evt) {
            case 'interactionCreate':
                const interaction : Interaction = args.interaction;

                if (!interaction.isCommand())
                    return;

                const command = this.commands.get(interaction.commandName);

                if (!command)
                    return;

                try {
                    await command.execute(interaction);
                } catch (error) {
                    this.log.error(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            break;
            case 'message': 
                const msg : Message = args.msg;
                const msg_str = msg.content;

                await this.on_message(msg);

                // beyond is only when administative commands are set to true
                if (this.administative_commands == false) return;

                msg.content = msg_str;

                // if not admin or not command return
                if (!this.is_admin(msg.author.id) || !this.is_prefixed(msg)) return;

                // if admin doesn't point this module, return
                if (!this.is_word(msg, this.module_name)) return;
                
                if (this.is_word(msg, "channel_id")) {

                    const key = "channel_id";

                    const channel_id = this.get_module_state(key);
                    const new_channel_id = this.get_unsigned(msg);
                    if (!new_channel_id) {

                        if (this.is_word(msg, "delete")) {

                            const p1 = this.delete_module_state(key);
                            const p2 = this.warn(msg, `deleting channel restriction for the module ${this.module_name}`);
                            await p1; await p2;
                            return;
                        }
                        return await this.warn(msg, "channel id is "+(channel_id ?? "<undefined>"));
                    }

                    const p1 = this.affirm(msg, `updating channel id to ${new_channel_id}, before it was ${channel_id ?? "<undefined>"}`);
                    const p2 = this.set_module_state(key, new_channel_id);
                    await p1, await p2;
                    return;
                }
            break;
            case 'messageReactionAdd':
            case 'messageReactionRemove':
                const reaction : MessageReaction = args.reaction;
                const user : User | PartialUser = args.user;
                if (evt == 'messageReactionAdd')                    
                    await this.on_reaction_add(reaction, user);
                else
                    await this.on_reaction_remove(reaction, user);
            break;
            case 'presenceUpdate':
                await this.on_presence_update(args[0], args[1]);
            break;
            case 'ready':
                await this.on_ready();
            break;
        }
    }
    public async init(refState: any) {

        this.state = refState;
        
        if (this.module_name == UNNAMED_MODULE)
            throw new Error("Module is UNNAMED while cache module db is enabled.");

        const task1 = (async () => {
            // load db state
            this.db_fetch_start = new Date();

            try {
                let json = (await db.get_module_state(this.module_name));
                if (json == undefined) {
                    json = {};
                    json[MS_DCUSERS] = {};
                }
                this.set_raw_ms(JSON.parse(json));
            } catch {
                let json : any = {};
                json[MS_DCUSERS] = {};
                this.set_raw_ms(json);
            } finally {
                this.db_fetch_start = undefined;
            }
        })();
        // await tasks
        await task1;
        await this.after_init();
    }
    protected is_initialized() : boolean {
        return this.db_fetch_start == undefined;
    }
    protected async sync_db_ms() {
        await tools.sync_module(this.module_name, ()=>this.get_raw_ms(), 1) 
    };
    protected get_module_state(key : string) : any {
        return this.get_raw_ms()[key];
    }
    protected get_module_state_users() : {[key : string] : module_user_state} {
        return this.get_raw_ms()[MS_DCUSERS];
    }
    protected get_module_state_user(user_id : string) : module_user_state {
        return ((this.get_raw_ms() ?? {})[MS_DCUSERS] ?? {})[user_id] ?? {};
    }
    protected get_module_state_user_value(user_id : string, key : string) : user_state_value {
        return this.get_module_state_user(user_id)[key];
    }
    protected set_module_state(key : string, value : string | number, dont_assert : boolean = false) {
        assert(dont_assert || FORBIDDEN_KEYS.includes(key) == false, "key can't be "+key+" because its been controlled by module");
        assert(dont_assert || key.startsWith(MS_BULK) == false, "key can't start with "+key+" because its been controlled by module");
        this.get_raw_ms()[key] = value;
        return this.queue_sync();
    }
    protected set_module_state_user(user_id : string, user_state : module_user_state) {
        if (this.get_raw_ms()[MS_DCUSERS] == undefined)
            this.get_raw_ms()[MS_DCUSERS] = {};
        this.get_raw_ms()[MS_DCUSERS][user_id] = user_state;
        return this.queue_sync();
    }
    protected upsert_module_state_user(user_id : string, user_state : module_user_state) {
        if (this.get_raw_ms()[MS_DCUSERS] == undefined)
            this.get_raw_ms()[MS_DCUSERS] = {};
        this.get_raw_ms()[MS_DCUSERS][user_id] = {...this.get_raw_ms()[MS_DCUSERS][user_id], ...user_state};
        return this.queue_sync();
    }
    protected set_module_state_user_value(user_id : string, key : string, value : user_state_value) {
        
        let json : any = this.get_module_state_user(user_id);
        if (json == undefined)
            json = {};
        if (this.get_module_state_user_value(key, user_id) == undefined) {
            json[key] = value;
            this.set_module_state_user(user_id, json);
        }
        else
            this.get_raw_ms()[MS_DCUSERS][user_id][key] = value;

        return this.queue_sync();
    }
    protected delete_module_state(key : string) {
        delete (this.get_raw_ms()[key]);
        return this.queue_sync();
    }
    protected async module_state_manual_sync_promise_queue() : Promise<void[]> {
        const promise = Promise.all(this.promises_module_state_queue);
        this.promises_module_state_queue = [];
        //return (async () => { await promise; return; })();
        return promise;
    }
    private async queue_sync() {
        const promise = this.sync_db_ms();
        this.promises_module_state_queue.push(promise);
        return promise;
    }
    private get_raw_ms() {
        return (this.state?.cache?.module ?? {})[this.module_name];
    }
    private set_raw_ms(value : any) {
        this.state.cache.module[this.module_name] = value;
    }

    // parsing
    protected is_prefixed(msg : Message) : boolean {
        return this.is_word(msg, this.state.prefix);
    }
    protected is_word(msg : Message, word : string) : boolean {
        return parser.is(msg, word);
    }
    protected async switch_word(msg : Message, cases : [string, () => void | Promise<void>][]) : Promise<boolean> {
        for (const [word, func] of cases) {
            if (this.is_word(msg, word)) {
                await func();
                return true;
            }
        }
        return false;
    }

    // parsers with getters
    protected get_unsigned(msg : Message) : number | null {
        let u : number | null = null;
        parser.u_arg(msg, (x : any) => u = x);
        return u;
    }
    protected get_mention(msg : Message) : string | null {
        let id : string | null = null;
        parser.mention(msg, (x : any) => id = x);
        return id;
    }
    protected get_word(msg : Message) : string | null {
        let word : string | null = null;
        parser.r_arg(msg, /^\w+/, (x : any) => word = x);
        return word;
    }

    // controls
    protected is_admin(user_id : string) : boolean {
        return constants.groups.admins.includes(user_id);
    }

    // send message back
    protected async warn(msg : Message, warning : string, bulk : boolean = false) {
        if (!bulk)
            return await parser.send_uwarn(msg, warning, true);
        else if (msg.channel.id)
            this.bulk_buffer(msg.channel.id, parser.get_uwarn(warning))
    }
    protected async affirm(msg : Message, affirmation : string, bulk : boolean = false) {
        if (!bulk)
            return await parser.send_uok(msg, affirmation, true);
        else if (msg.channel.id)
            this.bulk_buffer(msg.channel.id, parser.get_uok(affirmation))
    }
    protected async custom_info(msg : Message, information : string, format : string, bulk : boolean = false) {
        if (!bulk)
            return await parser.send_custom(msg, information, format, true);
        else if (msg.channel.id)
            this.bulk_buffer(msg.channel.id, parser.get_custom(information, format))
    }

    // bulk message system
    private bulk_buffer(channel_id : string, message : string) {
        
        let bulk = this.get_module_state(MS_BULK);
        if (bulk == undefined)
            bulk = {};

        if (bulk[channel_id] == undefined)
            bulk[channel_id] = [];

        bulk[channel_id].push(message);

        // ping bulk flusher
        tools.toggler_async(()=>this.flush_bulk_buffer(channel_id), MS_BULK, 5000);

        return this.set_module_state(MS_BULK, bulk, true);
            // last send = now
    }
    private async flush_bulk_buffer(channel_id : string) {
        const limit = 2000;
        const bulk = this.get_module_state(MS_BULK);
        let buffer = "";
        while (bulk[channel_id] != undefined && bulk[channel_id].length > 0) {
            const message = bulk[channel_id].shift();
            if (buffer.length + message.length /* + 1 */ > limit) {
                bulk[channel_id].unshift(message);
                break;
            }
            buffer += message;// + '\n';
        }
        const p1 = this.set_module_state(MS_BULK, bulk, true);
        if (buffer.length <= 0)
            return await p1;
        const channel = await this.get_client().channels.cache.get(channel_id) as TextChannel;
        if (channel != undefined) {
            await channel.send(buffer);
        }
        await p1;
    }

    // db operations wrapper
    protected user_stats(user_id : string) : Promise<{[key : string] : number | string }> {
        return db.get_user_value(user_id, "stats");
    }
    protected user_exp(user_id : string) : Promise<number> {
        return db.get_user_value(user_id, "exp");
    }

    // other wrappers
    protected calculate_hit(target_armor : number, self_sum_item_damage : number, self_experience : number, time_difference_seconds : number, cap : number) : number {
        
        const idmg = self_sum_item_damage;
        const expm = this.experience_multiplier(self_experience);
        const base_damage = tools.base_dmg(idmg, expm);
        const final_damage = tools.final_dmg(base_damage, time_difference_seconds, cap);
        return tools.ac_reduces_dmg(target_armor, final_damage) | 0;
    }
    protected experience_multiplier(experience : number) {
        return tools.getexpm(experience);
    }

    // to be overridden by child classes
    public async on_ready() {
        // load commands
        if (this.state.command_support !== true)
            return;

        const id = this.get_client().user?.id;
        const token = this.get_client().token;
        if (!id || !token) {
            throw new Error("can't register commands. id or token is null");
        }
        const tpid = dcmodule.guild_id_tp
        const rest = new REST({ version: '9' }).setToken(token);
        (async () => {
        try {
            this.log.info('Started refreshing application (/) commands.');

            const root = `build/discordbot/modules/${this.module_name}/commands/`;
            const commands_folder_files : string[] = tools.get_files_sync(root);
            const commandFiles = commands_folder_files.filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command : CommandModule = require("../../"+root+file.substring(0, file.length-3));
                // Set a new item in the Collection
                // With the key as the command name and the value as the exported module
                this.commands.set(command.data.name, command);
                this.log.info("Require/Loading command file: "+file);
            }
            const response = await rest.put(
                Routes.applicationGuildCommands(id, tpid),
                { body: this.commands.map(x => x.data.toJSON()) },
            );

            const res_arr = response as any[];
            if (!response || !res_arr) {
                throw Error("invalid response");
            }

            if (commandFiles.length != res_arr.length) {
                throw Error("response doesn't match with command length we sent.");
            }

            let tasks : Promise<void>[] = [];
            for (const json of res_arr) {
                const app_id : string = json.application_id;
                const name : string = json.name;
                const command = this.commands.get(name);
                if (!command) {
                    this.log.error(`json response with command name ${name} is not found on our side.`);
                    break;
                }
                // check if command has defined an permissions for its commands
                if (command.permissions) {

                    const client = this.get_client(); 
                    if (!client.application?.owner) await client.application?.fetch();

                    const app_command = await client.guilds.cache.get(dcmodule.guild_id_tp)?.commands.fetch(app_id);
                    if (!app_command) throw Error ("Can't fetch application command");
                    
                    await app_command.permissions.set({
                        permissions: command.permissions
                    });
                }
            }
            await Promise.all(tasks);

            this.log.info('Successfully reloaded application (/) commands.');
        }
        catch (error) {
            this.log.error(error);
            throw Error("Can't register commands in module.ts body");
        }})();
    }
    public async after_init() {}
    public async on_message(msg : Message) {}
    //public async on_command(command : string, interaction : CommandInteraction) {}
    public async on_reaction_add(reaction : MessageReaction, user : User | PartialUser) {}
    public async on_reaction_remove(reaction : MessageReaction, user : User | PartialUser) {}
    public async on_presence_update(new_p: Presence, old_p: Presence) {}
}