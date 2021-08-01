
import { GuildMember, Message, MessageReaction, PartialUser, Presence, Role, TextChannel, User } from "discord.js";
import { dcmodule } from "../module";



const this_dcmodule = class bilenrol extends dcmodule {
    
    private readonly ch_roles : string = "868227685636263956";

    constructor() { super(bilenrol.name, false); }
    
    public async after_init(){
        
        const channel = await this.get_client().channels.fetch(this.ch_roles);
        if (channel?.isText()) {
            const text_channel = channel as TextChannel;
            await text_channel.messages.fetch();
        }
        else {
            console.error("channel is not text");
        }
    }
    public async on_reaction_remove(reaction : MessageReaction, user : User | PartialUser) {
        await this.reaction_internal(reaction, user, false);
    }
    public async on_reaction_add(reaction : MessageReaction, user : User | PartialUser) {
        await this.reaction_internal(reaction, user, true);
    }
    private async reaction_internal(reaction : MessageReaction, user : User | PartialUser, add : boolean) {
        
        if (reaction.message.channel.id != this.ch_roles)
            return;

        enum role_type {
            language,
            fan_club
        };
        const language_roles = ["xml", "angular", "aspnet", "bootstrap", "css", "clang", "cplusplus", "csharp", "dart", "django", "ecmascript", "flutter", "fsharp", "go", "godot", "haskell", "html", "java", "javascript", "kotlin", "laravel", "lua", "mongodb", "mssql", "mysql", "nodejs", "perl", "php", "python", "react", "ruby", "rust", "sql", "typescript", "unity", "unrealengine", "visualbasic"];
        const fan_club_roles = ["ricardo", "risitas"];
        const language_roles_custom : any = {
            "microsoft": "mssql",
            "👢": "bootstrap",
            "logo_django2": "django",
        }

        // test to see if these are allowed roles
        let type : role_type;
        let role = reaction.emoji.name.toLowerCase();
        if (Object.keys(language_roles_custom).includes(role)) {
            role = language_roles_custom[role];
            type = role_type.language;
        }
        else if (language_roles.includes(role)) {
            type = role_type.language;
        }
        else if (fan_club_roles.includes(role)) {
            type = role_type.fan_club;
        }
        else {
            console.log("not allowed role: "+role);
            return;
        }
        role = (word => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` )(role);

        const guild = reaction.message.guild;
        if (!guild) {
            console.error("!guild");
            return;
        }
        // ensure the guild member
        const guild_member : GuildMember | undefined
            = await this.fetch_guild_member(guild, user.id)
        // if failed to ensure the guild member, we can't do anything about it
        // (remember: !null is true, !undefined is true)
        if (!guild_member) {
            console.error("!guild_member");
            return;
        }

        const role_postfix : {[key in role_type]: string} = {
            [role_type.fan_club]: "Fan",
            [role_type.language]: "Bilen",
        }
        const role_name = `${role} ${role_postfix[type]}`;
        const guild_roles = await guild.roles.fetch();
        const filter_result = guild_roles.cache.filter(x => x.name == role_name);
        let role_to_give : Role;
        if (filter_result.size != 0) {
            role_to_give = filter_result.first()!;
        }
        else {
            role_to_give = await guild.roles.create({data: {name: role_name}});
        }
        
        const p1 = role_to_give.setMentionable(true);
        let p2;
        // give the d to the user if s/he's not given yet, or remove depending on action
        //const found = reaction.users.cache.findKey(u => u.id == user.id) != null;
        if (add)
            p2 = guild_member.roles.add([role_to_give.id]);
        else
            p2 = guild_member.roles.remove([role_to_give.id]);

        console.log("allowed role: "+role);
        await p1; await p2;
    }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }
