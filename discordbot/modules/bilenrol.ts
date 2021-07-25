
import { GuildMember, Message, MessageReaction, PartialUser, Presence, Role, TextChannel, User } from "discord.js";
import { dcmodule } from "../module";



const this_dcmodule = class bilenrol extends dcmodule {
    
    private readonly ch_roles : string = "868227685636263956";

    constructor() { super(bilenrol.name, false); }
    
    public async after_init(){
        
        const guild = this.get_client().guilds.cache.filter(g => g.channels.cache.get(this.ch_roles) != undefined);
        if (guild.size == 0) {
            console.error("guild length == 0");
            return;
        }
        const channel = guild.first()!.channels.cache.get(this.ch_roles)!;
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

        const roles = ["angular", "aspnet", "bootstrap", "css", "clang", "cplusplus", "csharp", "dart", "django", "ecmascript", "flutter", "fsharp", "go", "godot", "haskell", "html", "java", "javascript", "kotlin", "laravel", "lua", "mongodb", "mssql", "mysql", "nodejs", "perl", "php", "python", "react", "ruby", "rust", "sql", "typescript", "unity", "unrealengine", "visualbasic"];
        const custom : any = {
            "microsoft": "mssql",
            "👢": "bootstrap",
            "logo_django2": "django",
        }

        // test to see if these are allowed roles
        let role = reaction.emoji.name.toLowerCase();
        if (Object.keys(custom).includes(role)) {
            role = custom[role];
        }
        else if (!roles.includes(role)) {
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

        const role_name = `${role} Bilen`;
        const guild_roles = await guild.roles.fetch();
        const filter_result = guild_roles.cache.filter(x => x.name == role_name);
        let role_to_give : Role;
        if (filter_result.size != 0) {
            role_to_give = filter_result.first()!;
        }
        else {
            role_to_give = await guild.roles.create({data: {name: role_name}});
        }

        // give the d to the user if s/he's not given yet, or remove depending on action
        //const found = reaction.users.cache.findKey(u => u.id == user.id) != null;
        if (add)
            await guild_member.roles.add([role_to_give.id]);
        else
            await guild_member.roles.remove([role_to_give.id]);

        console.log("allowed role: "+role);
    }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }
