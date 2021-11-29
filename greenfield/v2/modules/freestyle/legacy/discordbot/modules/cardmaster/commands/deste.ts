import { ButtonInteraction, CommandInteraction, Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { card, cards, card_no, rarity } from "../../../cardgame/data";
import { cardgame } from "../../../cardgame/game";
import { user_info } from "../../../log";
import { slash_command } from "../../../command.slash";
import { helper } from "../../../helper";
import { command_user_state, known_interactions } from "../../../commander";
import { operation } from "../../../command";

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
    const _card = cards[no];
    return new MessageEmbed()
        .setThumbnail(_card.link)
        .setTitle(`\`${_card.title}\``)
        .setDescription("```"+`${rarity_formats[_card.rarity]}\n[${_card.description}]`+"```")
        .addField(`\`Kart cinsi: ${rarity[_card.rarity]}\``, `No: ${no}\n\n\n`)
        .setColor(rarity_colors[_card.rarity]);
}

export const c = new class deste extends slash_command
{
	public constructor() {
		super(deste.name, "Kart oynama panelini açar", undefined, undefined,
		(s) => s.addBooleanOption(o => o
			.setDescription("Yeni veya eski set, varsayilan eski")
			.setName("yeni")) as SlashCommandBuilder
		);
	}

	public async execute(interaction: known_interactions, state: command_user_state): Promise<operation<command_user_state | null>>
	{
		const yeni = !(interaction instanceof CommandInteraction)
			? 0
			: !interaction.options.getBoolean("yeni", false) 
				? 0
				: 1
				;
			;
		const s = yeni * 25;
		const menu = new MessageActionRow().addComponents(new MessageSelectMenu()
			.setCustomId("menu")
			.setPlaceholder("Kart seç")
			.addOptions(
				helper.get_enum_keys(card_no).slice(0 + s, 25 + s).map((i: card_no) => {
					return { label: cards[i].title, value: i.toString(), };
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
				return operation.complete;
			}
			response.embeds = [card_embed(no)];
			state.state = no;
			response.components[0] = interaction.message.components?.[0] ??
				response.components[0];
			await interaction.update(response);
		}
		else if (interaction instanceof ButtonInteraction) {
			const no = state.state;
			if (false === no in card_no) {
				this.enum_error(no, "no", "card_no", interaction);
				return operation.complete;
			}
			response.embeds = [new MessageEmbed().setDescription("```Kart oynandi```")];
			response.components = [];
			await interaction.update(response);
			await (await interaction.channel?.fetch())?.isText()
				? interaction.channel?.send({
					content: "`"+`${interaction.user.username} bir kart oynadı.`+"`",
					embeds: [card_embed(no)]})
				: Promise.resolve();

			return operation.complete;
		}
		return operation.on(state);
	}
	
}();