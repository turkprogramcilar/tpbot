import { CommandInteraction, Interaction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!');
export async function execute(interaction : Interaction) {
    if (interaction instanceof CommandInteraction) 
		await interaction.reply({ content: 'Pong!', ephemeral: true});
}
