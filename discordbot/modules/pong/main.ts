import { Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { modern } from "../../modern";

export const m = new class pong extends modern {
    
    constructor() { super(pong.name); }
    
    public async on_message(msg : Message) {

        // if message is not prefixed, return
        if (!this.is_prefixed(msg)) return;

        // if message is prefix+ping then respond
        if (this.is_word(msg, "ping"))
            return await this.affirm(msg, "pong");
    }
};