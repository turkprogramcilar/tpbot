
import { Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { commander } from "../../commander";

export const m = new class ping extends commander {
    
    constructor() { super(ping.name, false); }
    
    public async after_init() { }
    public async on_message(msg : Message) {

        // if message is not prefixed, return
        if (!this.is_prefixed(msg)) return;

        // if message is prefix+ping then respond
        if (this.is_word(msg, "ping"))
            return await this.affirm(msg, "pong");
    }
};
