import { MessageEmbed, MessageReaction, PartialUser, User } from "discord.js";
import { dcmodule } from "../../module";
import { tp } from "../../tp";

enum powers {
    "🍅", "RICARDO", "NVIDIA"
}
export const m = new class warden extends dcmodule {

    private states: {[key: string]: {[key: string]: {[key in powers]: boolean}}} = {};
    constructor() { super(warden.name); }

    public async after_init()
    {
        await this.fetch_channel(tp.channel_id.gozalti);
    }
    public async on_reaction_add(reaction : MessageReaction, user : User | PartialUser)
    {
        if (reaction.message.channelId !== tp.channel_id.gozalti)
            return;
            
        const msg_author = reaction.message.member;
        if (!msg_author?.roles.cache.has(tp.role_id_gozalti))
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
        // ensure user statenv
        const user_id = user.id;
        let user_state = this.states[msg_id][user_id];
        if (!user_state) {
            user_state = this.states[msg_id][user_id] = {
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
        const gif = emoji === powers["🍅"]
            ? tp.gifs.tomato
            : tp.gifs.nvidia
            ;
        switch(emoji) {
        case powers["🍅"]:
        case powers.NVIDIA:
            await reaction.message.reply({embeds: [new MessageEmbed()
                .setDescription(msg)
                .setImage(gif)
            ]});
            break;
        case powers.RICARDO:
            const id = reaction.message.member?.id;
            const chan_id = reaction.message.channelId;
            if (!id) {
                await reaction.message.reply({embeds: [new MessageEmbed()
                    .setDescription(msg)
                    .setImage(tp.gifs.sicardo)
                ]});
                return;
            }
            await this.p2p_sicardo(id, msg_id, chan_id)
            break;
        default:
            throw new Error("Unexpected type error or not defined case at switch for enum");
        }
    }

}();