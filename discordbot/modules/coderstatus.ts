import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../module";


class coderstatus extends dcmodule {
    
    
    public async after_init(){}
    public async on_message(msg : Message){

        if (msg.content == "ping") await msg.channel.send("pong coderstatusW");
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) {}
    public async on_presence_update(new_p: Presence, old_p?: Presence) {

        // if null or empty, defensive coding
        if (!new_p) return;

        // define known coder applications that broadcast status message about coding
        const coder_apps = ["383226320970055681"];

        // test to see if user's new status update includes these app's in playing status
        enum todo {
            add,
            del,
        };
        const action : todo =
            new_p.activities.find(x => coder_apps.includes(x.applicationID ?? ""))
                ? todo.add
                : todo.del
                ;
        
        // ensure the guild member
        const guild_member : GuildMember | null
            = new_p.member ? new_p.member
            : new_p.guild  ? (
                // !"" is true, !undefined is true
                //  "" is false, undefined is false, two cases are tested below
                    new_p.userID ? (await this.fetch_guild_member(new_p.guild, new_p.userID)) ?? null
                : new_p.member ? (await this.fetch_guild_member(new_p.guild, new_p.member)) ?? null
                : null
            )
            : null
            ;
        // if failed to ensure the guild member, we can't do anything about it
        // (remember: !null is true, !undefined is true)
        if (!guild_member) return;

        // give the d to the user if s/he's not given yet, or remove depending on action
        const promise =
            action == todo.add
                ? guild_member.roles.add(["859338500494327810"])
                : guild_member.roles.remove(["859338500494327810"])
                ;
        await promise;
    }
}

const self = new coderstatus();
export async function on_event(evt: string, args: any) { return self.on_event(evt, args); }
export async function init(refState: any) { return self.init(refState); }