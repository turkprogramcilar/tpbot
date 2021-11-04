import { Message, MessageReaction, PartialUser, Presence, TextChannel, User } from "discord.js";
import { dcmodule } from "../../module";

export const m = new class auto_topic extends dcmodule {
    
    constructor() { super(auto_topic.name, false, false); }
    
    public async on_message(msg : Message) {

        if (msg.channel instanceof TextChannel) {
            
            if (msg.channel.rateLimitPerUser == 120) {

                msg.startThread({name: "👉Yorumlar", autoArchiveDuration: 1440});
            }
        }
    }
};