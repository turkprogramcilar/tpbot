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
const UNNAMED_MODULE : string = "unnamed_module";
// module state users for dc users
const MS_USERS : string = "dcusers";
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
            if (json == undefined) json = {};
            this.state.cache.module[this.module_name] = JSON.parse(json);
        } catch {
            this.state.cache.module[this.module_name] = {};
        } finally {
            this.db_fetch_start = undefined;
        }

        await this.after_init();
    }
    protected async sync_db_ms() {
        await tools.sync_module(this.module_name, ()=>this.state.cache.module[this.module_name], 1) 
    };
    protected get_module_state(key : string) : any {
        return this.state.cache.module[this.module_name][key];
    }
    protected set_module_state(key : string, value : string | number) {
        assert(MS_USERS != key, "key can't be MS_USERS because its been controlled by module");
        this.state.cache.module[this.module_name][key] = value;
        return this.push_sync();
    }
    protected set_module_state_user(key : string, value : {[key : string] : string | number | boolean}) {
        assert(MS_USERS != key, "key can't be MS_USERS because its been controlled by module");
        this.state.cache.module[this.module_name][MS_USERS] = value;
        return this.push_sync();
    }
    protected delete_module_state(key : string) {
        delete (this.state.cache.module[this.module_name]);
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

    // parsing
    protected set_msg(msg : Message) {
        this.msg = msg;
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