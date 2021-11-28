import { ButtonInteraction, GuildMember, GuildMemberRoleManager, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { mod_command } from "../../command.mod";
import { commander } from "../../commander";
import { dcmodule } from "../../module";
export const m = new class welcome extends commander 
{    
    constructor() { super(welcome.name, false); }
}()