import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../module";


class coderstatus extends dcmodule {
    
    constructor() { super(coderstatus.name, false); }
    
    public async after_init(){}
    public async on_message(msg : Message) {

        // if not a command, return
        if (!this.is_prefixed(msg)) return;
        
        // if not admin, return
        if (!this.is_admin(msg.author.id)) return;

        // add a coder app id to the database
        if (this.is_word(msg, "coder_app")) {

            const user_id = this.get_mention(msg);
            if (!user_id)
                return await this.warn(msg, `none is mentioned.`);

            const app_name = this.get_word(msg);
            if (!app_name)
                return await this.warn(msg, `app name is not given.`);

            // get the user
            const user = await this.get_client().users.fetch(user_id);

            // activities needs to be 1
            if (user.presence.activities.length != 1)
                return await this.warn(msg, `activities length is ${user.presence.activities.length} != 1`);

            const activity = user.presence.activities[0];

            const app_id = activity.applicationID;
            if (!app_id)
                return await this.warn(msg, `app_id is either undefined null or empty (or false kekw)`);
            
            // inform what's happening as the final action being taken
            const module_state_app_name = this.get_module_state(app_name);
            if (module_state_app_name)
                await this.warn(msg, `app name with ${app_name} was existing before "${module_state_app_name}". Updating with "${app_id}"...`);
            else
                await this.warn(msg, `app name with ${app_name} with id "${app_id}" is being added to the coder apps...`);

            // do the updates
            this.set_module_state(app_name, app_id);
            await this.sync_db_ms();
        }
        
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
            = Object.values( (this.get_module_state("coder_apps")) ?? {} ) ?? []
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