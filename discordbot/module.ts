// package imports
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
export class dcmodule {

    private msg : Message | undefined;
    protected db_fetch_start : Date | undefined;
    protected state: any;
    private promises_module_state_push : Promise<void>[] = [];

    constructor(protected module_name : string = UNNAMED_MODULE, protected cache_module_db : boolean = false, ) { }
    
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
            case 'message': const msg : Message = args.msg;
                await this.on_message(msg);
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
        
        if (!this.cache_module_db) return;
        if (this.module_name == UNNAMED_MODULE)
            throw new Error("Module is UNNAMED while cache module db is enabled.");

        this.db_fetch_start = new Date();

        try {
            const json = (await db.get_module_state(this.module_name));
            this.state.cache.module[this.module_name] = JSON.parse(json);
        } catch {
            this.state.cache.module[this.module_name] = {};
        } finally {
            this.db_fetch_start = undefined;
        }

        await this.after_init();
    }
    protected async sync_db_ms() {
        await tools.sync_module(this.module_name, ()=>this.get_module_state(), 1) 
    };
    protected get_module_state() : any {
        return this.state.cache.module[this.module_name];
    }
    protected set_module_state(key : string, value : any, auto_sync : boolean = true) {
        this.get_module_state()[key] = value;
        if (auto_sync) this.promises_module_state_push.push(this.sync_db_ms());
    }
    protected async module_state_push() : Promise<void[]> {
        const promise = Promise.all(this.promises_module_state_push);
        this.promises_module_state_push = [];
        //return (async () => { await promise; return; })();
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
    protected async inform(information : string) {
        return await parser.send_uwarn(this.msg, information, true);
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