import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { command_module } from "../module";


export const c = new class command implements command_module {

    public readonly data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!');
    public async execute(interaction : CommandInteraction) {
        await interaction.reply({ content: 'Pong!', ephemeral: true});
    }
}