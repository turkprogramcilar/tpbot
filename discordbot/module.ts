// package imports
import { Message, Client, User, PartialUser, MessageReaction, Presence, GuildManager, Guild } from "discord.js";
// local imports
const db    = require("../../discordbot/mongodb");
const tools = require("../../discordbot/tools");

/**
 * 
    if (fetch_start) return await parser.send_uwarn(msg,
        "Modul halen yukleniyor... Lutfen bir sure sonra tekrar deneyin.");
 */
const UNNAMED_MODULE : string = "unnamed_module";
export class dcmodule {


    protected db_fetch_start : Date | undefined;
    protected state: any;

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
        await tools.sync_module(this.module_name, ()=>this.state.cache.module[this.module_name], 1) 
    };
    protected get_ms() : any {
        return this.state.cache.module[this.module_name];
    }

    public async after_init() {}
    public async on_message(msg : Message) {}
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) {}
    public async on_presence_update(new_p: Presence, old_p: Presence) {}
}


// boilerplate code:
/* 

import { Message, MessageReaction, PartialUser, User } from "discord.js";
import { dcmodule } from "../module";


class coderstatus extends dcmodule {
    
    
    public async after_init(){}
    public async on_message(msg : Message){

        if (msg.content == "ping") await msg.channel.send("pong");
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser){}
}

const self = new coderstatus();
export async function on_event(evt: string, args: any) { return self.on_event(evt, args); }
export async function init(refState: any) { return self.init(refState); }

*/