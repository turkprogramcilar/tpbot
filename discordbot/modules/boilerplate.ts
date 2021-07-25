import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../module";



const this_dcmodule = class boilerplate extends dcmodule {
    
    constructor() { super(boilerplate.name, false); }
    
    public async after_init() { 
        
    }
    public async on_message(msg : Message) {


        // if not a command, return
        if (!this.is_prefixed(msg)) return;

        if (this.is_word(msg, "ping"))
            return await this.affirm(msg, "pong");
        
        // if not admin, return
        if (!this.is_admin(msg.author.id)) return;

        // add a coder app id to the database
        if (this.is_word(msg, "echo")) 
            return await this.affirm(msg, this.get_word(msg) ?? "<no echo message>");
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }