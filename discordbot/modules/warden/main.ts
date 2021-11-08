import { MessageEmbed, MessageReaction, PartialUser, User } from "discord.js";
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

        const emoji_str = reaction.emoji.name ?? "";
        // converts string into type-safe enum value by matching the enum value
        const enum_values = (x=>x.slice(0,Math.ceil(x.length/2)))(Object.values(powers));
        if (!enum_values.includes(emoji_str))
            return;
        
        const emoji_key: number = Number(Object.entries(powers).find(([k, v]) => v === emoji_str)?.[0]);
        const emoji: powers = emoji_key;
        
        // ensure msg state
        const msg_id = reaction.message.id;
        const msg_state = this.states[msg_id];
        if (!msg_state) {
            this.states[msg_id] = {};
        }
        // ensure user state
        const user_id = user.id;
        const user_state = this.states[msg_id][user_id];
        if (!user_state) {
            this.states[msg_id][user_id] = {
                [powers["🍅"]]: true,
                [powers.RICARDO]: true,
                [powers.NVIDIA]: true,
            }
        }
        else {
            if (!user_state[emoji])
                return;
        }
        user_state[emoji] = false;

        if (Math.random() >= 0.1)
            return;
            
        const msg = `${user.username} aşağıdaki mesajı sana iletti`;
        switch(emoji) {
        case powers.NVIDIA:
            await reaction.message.reply({embeds: [new MessageEmbed()
                .setDescription(msg)
                .setImage()
            ]});
            break;
        case powers.RICARDO:
            
            break;
        case powers["🍅"]:
            break;
        default:
            throw new Error("Unexpected type error or not defined case at switch for enum");
        }
    }

}();