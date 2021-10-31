import { Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../../module";

export const m = new class ddg extends dcmodule {
    
    constructor() { super(ddg.name, false, false); }
    
    public async after_init() { }
    public async on_message(msg : Message) {

        // if message is not prefixed, return
        if (!this.is_prefixed(msg)) return;

        // if message is prefix+ping then respond
        if (this.is_word(msg, ddg.name))
            await msg.channel.send(`https://duckduckgo.com/?q=${encodeURIComponent(msg.content)}`);
    }
};