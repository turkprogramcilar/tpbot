// package imports
import { assert } from "console";
import { Message, Client, User, PartialUser, MessageReaction, Presence, Guild, TextChannel, Interaction, GuildMember } from "discord.js";
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

const UNNAMED_MODULE : string = "unnamed_module";
// module state users for dc users
const MS_DCUSERS : string = "dcusers";
const MS_BULK : string = "bulkmessages";
const FORBIDDEN_KEYS : string[] = [MS_DCUSERS, MS_BULK];

export class dcmodule {
    // some constants
    static readonly guild_id_tp     : string = constants.sid.tpdc;
    static readonly role_id_kurucu  : string = constants.rid.kurucu;
    static readonly role_id_koruyucu: string = "782712917900525628";
    static readonly role_id_kidemli : string = constants.rid.kidemli;
    static readonly role_id_tp_uyesi: string = constants.rid.tp_uyesi;
    static readonly role_id_gozalti : string = constants.rid.gozalti;
    //
    static readonly user_id = {
        deadcode: "824573651390562325",
        logbot: "841479314519752784",
        chunk: "272044185689915392",
    }
    //
    static readonly channel_id = {
        onay: "900650376762626078",
        bir_bak_buraya: constants.cid.bir_bak_buraya,
        roller: constants.cid.roller,
        // soru sor
        yazilim_sor: constants.cid.yazilim_sor,
        kafamda_deli_sorular: constants.cid.kafamda_deli_sorular,
        kodlama_disi_sor: constants.cid.kodlama_disi_sor,
        // main
        sohbet: constants.cid.sohbet,
        istek_oneri_sikayet: constants.cid.istek_oneri_sikayet,
        // tp oyunlari
        sicardo_nvidia: "782713536924221469",
        // paylasimlar
        proje_paylas: constants.cid.proje_paylas,
        // yonetim
        yetkili_komutlari: "851031980250103888",
        yonetim_dedikodu: constants.cid.yonetim_dedikodu,
        // gozalti
        gozalti: "836521603319595008",
        // tpbot
        tpbot_test_odasi: constants.cid.tpbot_test_odasi,
        tpbot_p2p: "824685500686008350",
    }

    // fields
    protected db_fetch_start : Date | undefined = new Date();
    protected state: any;
    private promises_module_state_queue : Promise<void>[] = [];

    // public readonly fields
    public readonly log = new log(this.module_name);
    // ctor
    constructor(
        protected module_name : string = UNNAMED_MODULE, 
        protected administative_commands : boolean = false,
        private has_commands: boolean = true) 
    {

    }
    
    // props
    public get_client() : Client { 
        return this.state.client; 
    }
    public is_admin(user_id : string) : boolean {
        return constants.groups.admins.includes(user_id);
    }

    // init for module loader system defined in bot.js
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
    // called after bot.js init (can be overridden by child modules)
    public async after_init() {

    }
    // on_event for receiving events from bot.js
    public async on_event(evt: string, args: any) {

        switch(evt) {
        case 'ready'            : await this.on_ready();                             break;
        case 'message'          : await this.on_message(args.msg);                   break;
        case 'presenceUpdate'   : await this.on_presence_update(args[0], args[1]);   break;
        case 'interactionCreate': await this.on_interaction_create(args.interaction);break;
        case 'guildMemberAdd'   : await this.on_guild_member_add(args.member);       break;
        case 'guildMemberRemove': await this.on_guild_member_remove(args.member);    break;

        case 'messageReactionAdd':
        case 'messageReactionRemove':
            const reaction : MessageReaction = args.reaction;
            const user : User | PartialUser = args.user;
            if (evt == 'messageReactionAdd')                    
                await this.on_reaction_add(reaction, user);
            else
                await this.on_reaction_remove(reaction, user);
        break;
        }
    }
    protected async on_guild_member_add(member: GuildMember) { }
    protected async on_guild_member_remove(member: GuildMember) { }
    protected async on_ready() { }
    protected async on_interaction_create(interaction : Interaction) {

        this.log.verbose("MODULE.TS ON_INTERACTION_CREATE", interaction);
    }
    protected async on_message(msg : Message)
    {
        this.administrative_channel_adjust(msg);
    }
    protected async on_reaction_add(reaction : MessageReaction, user : User | PartialUser) {}
    protected async on_reaction_remove(reaction : MessageReaction, user : User | PartialUser) {}
    protected async on_presence_update(new_p: Presence, old_p: Presence) {}

    // client helper methods for fetching
    public fetch_user(user_id : string) { 
        return this.get_client().users.fetch(user_id);
    }
    public fetch_guild_member(guild : Guild, user_id : string) { 
        return guild.members.cache.get(user_id);
    }
    public async fetch_channel(channel_id: string, retry: number = 5)
    {
        try {
            const channel = await this.get_client().channels.fetch(channel_id);
            if (!channel) {
                throw new Error("channel is null");
            }
            if (!channel.isText()) {
                throw new Error("channel is not text");
            }
            const text_channel = channel as TextChannel;
            await text_channel.messages.fetch();

        } catch (error) {

            retry -= 1;
            this.log.warn(`An error occurred in ${this.fetch_channel.name}... Will retry if retry[${retry}] != 0`);
            this.log.error(error);
            if (retry !== 0)
                setTimeout(() => this.fetch_channel(channel_id, retry), 1000);
        }
    
    }

    // database and module state methods
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
    protected is_regex(msg : Message, regex: RegExp) : RegExpMatchArray | null {
        let result : RegExpMatchArray | null = null;
        const save = msg.content;
        parser.r_arg(msg, regex, (x : any) => result = x);
        if (result)
            return save.match(regex);
        return result;
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

    // administrative
    protected async administrative_channel_adjust(msg : Message) {

        // beyond is only when administative commands are set to true
        if (this.administative_commands == false) return;

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
    }
}