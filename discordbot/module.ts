// package imports
import { assert } from "console";
import { channel } from "diagnostic_channel";
import { Message, Client, User, PartialUser, MessageReaction, Presence, GuildManager, Guild } from "discord.js";
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

type user_state_value = string | number | boolean | undefined;
type module_user_state = {[key : string] : user_state_value};

const UNNAMED_MODULE : string = "unnamed_module";
// module state users for dc users
const MS_DCUSERS : string = "dcusers";
export class dcmodule {

    private msg : Message | undefined;
    protected db_fetch_start : Date | undefined;
    protected state: any;
    private promises_module_state_push : Promise<void>[] = [];

    constructor(
        protected module_name : string = UNNAMED_MODULE, 
        protected administative_commands : boolean = false) { }
    
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
            case 'message': 
                const msg : Message = args.msg;
                const msg_str = msg.content;

                await this.on_message(msg);

                // beyond is only when administative commands are set to true
                if (this.administative_commands == false) return;

                msg.content = msg_str;
                this.set_msg(msg);

                // if not admin or not command return
                if (!this.is_admin(msg.author.id) || !this.is_prefixed()) return;

                // if admin doesn't point this module, return
                if (!this.is_word(this.module_name)) return;
                
                if (this.is_word("channel_id")) {

                    const key = "channel_id";

                    const channel_id = this.get_module_state(key);
                    const new_channel_id = this.get_unsigned();
                    if (!new_channel_id) {

                        if (this.is_word("delete")) {

                            const p1 = this.delete_module_state(key);
                            const p2 = this.warn(`deleting channel restriction for the module ${this.module_name}`);
                            await p1; await p2;
                            return;
                        }
                        return await this.warn("channel id is "+(channel_id ?? "<undefined>"));
                    }

                    const p1 = this.affirm(`updating channel id to ${new_channel_id}, before it was ${channel_id ?? "<undefined>"}`);
                    const p2 = this.set_module_state(key, new_channel_id);
                    await p1, await p2;
                    return;
                }
            break;
            case 'messageReactionAdd':
                const reaction : MessageReaction = args.reaction;
                const user : User | PartialUser = args.user;
                await this.on_reaction(reaction, user);
            break;
            case 'presenceUpdate':
                await this.on_presence_update(args[0], args[1]);
        }
    }
    public async init(refState: any) {

        this.state = refState;
        
        if (this.module_name == UNNAMED_MODULE)
            throw new Error("Module is UNNAMED while cache module db is enabled.");

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

        await this.after_init();
    }
    protected async sync_db_ms() {
        await tools.sync_module(this.module_name, ()=>this.get_raw_ms(), 1) 
    };
    protected get_module_state(key : string) : any {
        return this.get_raw_ms()[key];
    }
    protected get_module_state_user(user_id : string) : module_user_state {
        return this.get_raw_ms()[MS_DCUSERS][user_id] ?? {};
    }
    protected get_module_state_user_value(user_id : string, key : string) : user_state_value {
        return this.get_module_state_user(user_id)[key];
    }
    protected get_module_state_author() : module_user_state {
        return this.get_module_state_user(this.get_msg().author.id);
    }
    protected get_module_state_author_value(key : string) : user_state_value {
        return this.get_module_state_author()[key];
    }
    protected set_module_state(key : string, value : string | number) {
        assert(MS_DCUSERS != key, "key can't be "+MS_DCUSERS+" because its been controlled by module");
        this.get_raw_ms()[key] = value;
        return this.push_sync();
    }
    protected set_module_state_user(user_id : string, user_state : module_user_state) {
        this.get_raw_ms()[MS_DCUSERS][user_id] = user_state;
        return this.push_sync();
    }
    protected set_module_state_user_value(user_id : string, key : string, value : user_state_value) {
        if (this.get_module_state_user_value(key, user_id) == undefined) {
            let json : any = {}
            json[key] = value;
            this.set_module_state_user(user_id, json);
        }
        else
            this.get_raw_ms()[MS_DCUSERS][user_id][key] = value;

        return this.push_sync();
    }
    protected set_module_state_author(user_state : module_user_state) {
        return this.set_module_state_user(this.get_msg().author.id, user_state);
    }
    protected set_module_state_author_value(key : string, value : user_state_value) {
        return this.set_module_state_user_value(this.get_msg().author.id, key, value);
    }
    protected delete_module_state(key : string) {
        delete (this.get_raw_ms()[key]);
        return this.push_sync();
    }
    protected async module_state_push() : Promise<void[]> {
        const promise = Promise.all(this.promises_module_state_push);
        this.promises_module_state_push = [];
        //return (async () => { await promise; return; })();
        return promise;
    }
    private async push_sync() {
        const promise = this.sync_db_ms();
        this.promises_module_state_push.push(promise);
        return promise;
    }
    private get_raw_ms() {
        return this.state.cache.module[this.module_name];
    }
    private set_raw_ms(value : any) {
        this.state.cache.module[this.module_name] = value;
    }

    // parsing
    protected set_msg(msg : Message) {
        this.msg = msg;
    }
    protected get_msg() : Message {
        const m = this.msg;
        if (!m) throw Error(this.get_msg.name + "() can't be called before setting msg with " + this.set_msg.name);
        return m;
    }
    protected is_prefixed() : boolean {
        return this.is_word(this.state.prefix);
    }
    protected is_word(word : string) : boolean {
        return parser.is(this.msg, word);
    }
    // parsers with getters
    protected get_unsigned() : number | null {
        let u : number | null = null;
        parser.u_arg(this.msg, (x : any) => u = x);
        return u;
    }
    protected get_mention() : string | null {
        let id : string | null = null;
        parser.mention(this.msg, (x : any) => id = x);
        return id;
    }
    protected get_word() : string | null {
        let word : string | null = null;
        parser.r_arg(this.msg, /^\w+/, (x : any) => word = x);
        return word;
    }

    // controls
    protected is_admin(user_id : string) : boolean {
        return constants.groups.admins.includes(user_id);
    }

    // send message back
    protected async warn(warning : string) {
        return await parser.send_uwarn(this.msg, warning, true);
    }
    protected async affirm(information : string) {
        return await parser.send_uok(this.msg, information, true);
    }

    public async after_init() {}
    public async on_message(msg : Message) {}
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) {}
    public async on_presence_update(new_p: Presence, old_p: Presence) {}
}


// boilerplate code:
/* 


import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../module";


const this_dcmodule = class newmodule extends dcmodule {
    
    constructor() { super(newmodule.name, false); }
    
    public async after_init(){}
    public async on_message(msg : Message) {

         // assign message to the parser
        this.set_msg(msg);

        // if not a command, return
        if (!this.is_prefixed()) return;

        if (this.is_word("ping"))
            return await this.inform("pong");
        
        // if not admin, return
        if (!this.is_admin(msg.author.id)) return;

        // add a coder app id to the database
        if (this.is_word("echo")) 
            return await this.inform(this.get_word() ?? "<no echo message>");
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }

*/