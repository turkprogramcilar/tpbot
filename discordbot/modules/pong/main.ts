import { Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../../module";

export const m = new class pong extends dcmodule {
    
    constructor() { super(pong.name, false); }
    
    public async after_init() { }
    public async on_message(msg : Message) {

        // if message is not prefixed, return
        if (!this.is_prefixed(msg)) return;

        // if message is prefix+ping then respond
        if (this.is_word(msg, "ping"))
            return await this.affirm(msg, "pong");
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }
};