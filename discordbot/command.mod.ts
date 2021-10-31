import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types";
import { ApplicationCommandPermissionData, ContextMenuInteraction, Message, MessageEmbed } from "discord.js";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { command } from "./command";
import { known_interactions, command_user_state, dcmodule } from "./module";


export abstract class mod_command {

    public readonly data: ContextMenuCommandBuilder;
	
	public constructor(protected command_name: string, public permissions: ApplicationCommandPermissionData[])
	{
		const DEBUG = process.env.DCBOT_DEBUG;
        if (DEBUG !== undefined) {
            this.command_name = "debug_"+this.command_name;
        }
        this.data = new ContextMenuCommandBuilder()
			.setName(this.command_name)
			.setType(ApplicationCommandType.Message)
			;
        if (DEBUG !== undefined) {
            this.data = this.data.setDefaultPermission(false);
            this.permissions = [
                { id: dcmodule.role_id_kidemli,  type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
                { id: dcmodule.role_id_kurucu,   type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
            ];
        }
        else if (this.permissions)
            this.data = this.data.setDefaultPermission(false);
		else
			throw new Error("Permissions is not set for a command that has a moderation power.");
	}
	public async execute(interaction: known_interactions, state: command_user_state) {

		if (interaction instanceof ContextMenuInteraction) {

			const yetkili_komutlari = dcmodule.channel_id.yetkili_komutlari;
			const yetkili_komutlari_channel = await interaction.guild?.channels.fetch(yetkili_komutlari)

			const target_channel = await interaction.guild?.channels.fetch(interaction.channelId);
			let target_message: Message;

			if (!yetkili_komutlari_channel?.isText() 
			 || !target_channel?.isText()
			 || !(target_message = await target_channel.messages.fetch(interaction.targetId))) {

				await command.respond_interaction_failure_to_user(interaction);
				return null;
			}
			const gozalti = dcmodule.channel_id.gozalti;
			const mod_command = `\`${this.command_name}`;
			const op = interaction.user;
			const target_user = target_message.author;
			const p1 = yetkili_komutlari_channel.send({
				content: `${mod_command} ${target_user.id}`, 
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
			const p2 = interaction.reply({ content: `${target_user.username} kullanıcısı üzerinde <#${yetkili_komutlari}> kanalında \`${mod_command}\` komutu çalıştırıldı. Kullanıcı artık <#${gozalti}> kanalında.`, ephemeral: true});
			await p1, p2;
		}
		
		return null;
	}
}