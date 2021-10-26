import { CommandInteraction } from "discord.js";
import { command } from "../../../command";
import { known_interactions, command_user_state } from "../../../module";


export const c = new class ping extends command {
	public constructor() {
		super(ping.name, "Pong diye cevap verir!");
	}
	public async execute(interaction: known_interactions, state: command_user_state) {
		if (interaction instanceof CommandInteraction) 
			await interaction.reply({ content: 'Pong!', ephemeral: true});
		return null;
	}
	
}