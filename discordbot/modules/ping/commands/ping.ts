import { CommandInteraction } from "discord.js";
import { slash_command, operation } from "../../../command.slash";
import { command_user_state, known_interactions } from "../../../modern";


export const c = new class ping extends slash_command
{
	public constructor()
	{
		super(ping.name, "Ping diye cevap verir!");
	}

	public async execute(interaction: known_interactions, state: command_user_state): Promise<operation<command_user_state | null>>
	{
		if (interaction instanceof CommandInteraction) {
			await interaction.reply({ content: 'Ping!', ephemeral: true});
		}

		return operation.complete;
	}
}