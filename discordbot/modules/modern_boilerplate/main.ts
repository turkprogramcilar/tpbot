import { CommandInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../../module";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const this_dcmodule = class modern_boilerplate extends dcmodule {
    
    constructor() { super(modern_boilerplate.name, false); }
    
    public async after_init() {
    }
    public async on_command(command : String, interaction : CommandInteraction) {

        if (command === 'ping') {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('primary')
                        .setLabel('Primary')
                        .setStyle('PRIMARY'),
                );
    
            await interaction.reply({ content: 'Pong!', components: [row], ephemeral: true });
        }
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }