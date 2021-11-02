import { ButtonInteraction, CommandInteraction, Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { cards, card_no } from "../cardgame.data";
import { card_text, card_texts, rarity } from "../cardgame.text";
import { command_user_state, dcmodule, known_interactions } from "../../../module";
import { cardgame } from "../cardgame";
import { user_info } from "../../../log";
import { command } from "../../../command";

/*

	/kartoyunu

	select menu:[ "iboyd", "sampiyonluk", "kacak rabir gel buraya" ]
	buttons    :[ oda aç 5 tl ] [ odaya gir 2 tl ]

	---- oda aç ----
	[ oda başlığı ]

	---- odada beklerken ----
	Oyuncu 1: self
	Oyuncu 2:
	[ odayı kapat ][ oyunu başlat : dısabled]
*/
interface cardgame_user_state extends command_user_state {
	is_owner: boolean,
	self: user_info,
	enemy: user_info | undefined,
	engine_state: cardgame | undefined,
}
const module_name = "deste";
const rarity_colors: {[key in rarity]: readonly[number,number,number] } = {
    1: [88,  110, 117],
    2: [131, 148, 150],
    3: [42,  161, 152],
    4: [181, 137, 0],
    5: [203, 75,  22]
}
const rarity_formats: {[key in rarity]: string} =  {
    1: "brainfuck",
    2: "",
    3: "yaml",
    4: "fix",
    5: "css"
}
const card_embed = (no: card_no) => {
    const card : card_text = card_texts[no];
    return new MessageEmbed()
        .setThumbnail(card.link)
        .setTitle(`\`${card.title}\``)
        .setDescription("```"+`${rarity_formats[card.rarity]}\n[${card.description}]`+"```")
        .addField(`\`Kart cinsi: ${rarity[card.rarity]}\``, `No: ${no}\n\n\n`)
        .setColor(rarity_colors[card.rarity]);
}

export const c = new class deste extends command
{
	public constructor() {
		super(deste.name, "Kart oynama panelini açar");
	}

	public async execute(interaction: known_interactions, state: command_user_state): Promise<command_user_state | null>
	{
		const menu = new MessageActionRow().addComponents(new MessageSelectMenu()
			.setCustomId("menu")
			.setPlaceholder("Kart seç")
			.addOptions(
				dcmodule.enum_keys(card_no).map((i: card_no) => {
					return { label: card_texts[i].title, value: i.toString(), };
				})
			),
		);
		const buttons = new MessageActionRow().addComponents(new MessageButton()
			.setCustomId("buttons")
			.setLabel("Seçili kartı oyna")
			.setStyle("PRIMARY"),
		);

		const response: any = { content: "`Deste`", components: [menu, buttons], ephemeral: true };

		if (interaction instanceof CommandInteraction) {
			await interaction.reply(response);
		}
		else if (interaction instanceof SelectMenuInteraction) {
			const no = Number(interaction.values[0]);
			if (false === no in card_no) {
				this.enum_error(no, "no", "card_no", interaction);
				return null;
			}
			response.embeds = [card_embed(no)];
			state.state = no;
			await interaction.update(response);
		}
		else if (interaction instanceof ButtonInteraction) {
			const no = state.state;
			if (false === no in card_no) {
				this.enum_error(no, "no", "card_no", interaction);
				return null;
			}
			response.embeds = [new MessageEmbed().setDescription("```Kart oynandi```")];
			response.components = [];
			await interaction.update(response);
			await (await interaction.channel?.fetch())?.isText()
				? interaction.channel?.send({
					content: "`"+`${interaction.user.username} bir kart oynadı.`+"`",
					embeds: [card_embed(no)]})
				: Promise.resolve();

			return null;
		}
		return state;
	}
	
}