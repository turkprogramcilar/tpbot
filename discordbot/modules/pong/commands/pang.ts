import { CommandInteraction } from "discord.js";
import { operation } from "../../../command";
import { slash_command } from "../../../command.slash";
import { known_interactions, command_user_state } from "../../../commander";


export const c = new class pang extends slash_command
{
	public constructor()
	{
		super(pang.name, "Pang diye cevap verir!");
	}

	public async execute(interaction: known_interactions, state: command_user_state)
	{
		if (interaction instanceof CommandInteraction) {
			await interaction.reply({ content: 'Pang!', ephemeral: true});
		}

		return operation.complete;
	}
}