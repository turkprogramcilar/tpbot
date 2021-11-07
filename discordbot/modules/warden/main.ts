import { MessageReaction, PartialUser, User } from "discord.js";
import { dcmodule } from "../../module";

enum powers {
    "🍅", "RICARDO", "NVIDIA"
}
export const m = new class warden extends dcmodule {

    private states: {[key: string]: {[key: string]: {[key in powers]: boolean}}} = {};
    constructor() { super(warden.name); }

    public async after_init()
    {
        await this.fetch_channel(dcmodule.channel_id.gozalti);
    }
    public async on_reaction_add(reaction : MessageReaction, user : User | PartialUser)
    {
        if (reaction.message.channelId !== dcmodule.channel_id.gozalti)
            return;
            
        const msg_author = reaction.message.member;
        if (!msg_author?.roles.cache.has(dcmodule.role_id_gozalti))
            return;

        if (reaction.message.createdAt.getTime() + 1*24*60*60*1000 < new Date().getTime())
            return;

        const emoji = reaction.emoji.name ?? "";
        if (!Object.keys(powers).includes(emoji))
            return;

        const msg_state = this.states[emoji];
    }

}();