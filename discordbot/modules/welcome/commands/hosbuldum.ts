import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { dcmodule } from "../../../module";

export const data = new SlashCommandBuilder()
    .setName('hosbuldum')
    .setDescription('Türk programcılar onay sistemini başlatır')
    .setDefaultPermission(false);

export const permissions = [
    { id: dcmodule.role_id_hosgeldiniz, type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
    { id: dcmodule.role_id_kidemli,     type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
    { id: dcmodule.role_id_kurucu,      type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
];

export async function execute(interaction : CommandInteraction) {
    await interaction.reply({ content: 'Pong!', ephemeral: true});
}