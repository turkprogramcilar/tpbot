import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../module";


class coderstatus extends dcmodule {
    
    constructor() { super(coderstatus.name, true); }
    
    public async after_init(){
        // below code manually pushes the states into db
        
        /*const ref = this.get_ms();
        ref.coder_apps = {
            vscode_icrawl: "383226320970055681",
            pycharm: "547843598369161278"
        }
        await this.sync_db_ms();*/
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) {}
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) {

        // if null or empty, defensive coding
        if (!new_p) return;

        // test to see if user's new status update includes these app's in playing status
        enum todo {
            add,
            del,
        };

        const coder_apps : string[]
            = Object.values( (this.get_ms()?.coder_apps) ?? {} ) ?? []
            ;

        const action : todo =
            new_p.activities.find(x => Object.values(coder_apps).includes(x.applicationID ?? ""))
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
        if (action == todo.add)
            await guild_member.roles.add(["859338500494327810"]);
        else
            await guild_member.roles.remove(["859338500494327810"]);
    }
}

const self = new coderstatus();
export async function on_event(evt: string, args: any) { return self.on_event(evt, args); }
export async function init(refState: any) { return self.init(refState); }