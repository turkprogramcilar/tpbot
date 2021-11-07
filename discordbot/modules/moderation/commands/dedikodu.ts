import { ContextMenuInteraction, Message, MessageEmbed } from "discord.js";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { mod_command } from "../../../command.mod";
import { command_user_state, known_interactions } from "../../../commander";
import { dcmodule } from "../../../module";
import { command, operation } from "../../../command";

export const c = new class dedikodu extends mod_command
{
    public constructor()
    {
        super(dedikodu.name);
    }

	public async execute(interaction: known_interactions, state: command_user_state) {

		if (interaction instanceof ContextMenuInteraction) {

			const info_channel_id = dcmodule.channel_id.yonetim_dedikodu;
			const info_channel = await interaction.guild?.channels.fetch(info_channel_id)

			const target_channel = await interaction.guild?.channels.fetch(interaction.channelId);
			let target_message: Message;

			if (!info_channel?.isText() 
			 || !target_channel?.isText()
			 || !(target_message = await target_channel.messages.fetch(interaction.targetId))) {

				await command.respond_interaction_failure_to_user(interaction);
				return operation.complete;
			}
			const mod_command = `${this.command_name}`;
			const op = interaction.user;
			const target_user = target_message.author;
			const p1 = info_channel.send({
				embeds: [
					// pass new MessageEmbed() into lambda function. if message has attachments, setImage, else return embed as is
					(x=>target_message.attachments.size == 0 ? x : x.setImage(target_message.attachments.first()!.url))
					(new MessageEmbed()
						.setThumbnail(target_user.avatarURL() ?? target_user.displayAvatarURL())
						.setAuthor(op.username, op.avatarURL() ?? op.displayAvatarURL())
						.setTitle(`${target_user.username} üzerinde \`${mod_command}\` komutu çalıştırdı. Mesaja gitmek için tıklayınız`)
						.setDescription(target_message.content)
						.setURL(target_message.url)
					)	
				]
			});
			const p2 = interaction.reply({ content: `${target_user.username} kullanıcısı üzerinde \`${mod_command}\` komutu çalıştırıldı. Bilgilendirme <#${info_channel_id}> kanalında yapıldı.`, ephemeral: true});
			await p1, p2;
		}
		
		return operation.complete;
	}
}();