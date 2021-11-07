import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types";
import { ApplicationCommandPermissionData, ButtonInteraction, ContextMenuInteraction, Message, MessageEmbed, TextBasedChannels, User } from "discord.js";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { command, operation } from "./command";
import { known_interactions, command_user_state } from "./commander";
import { dcmodule } from "./module";


export abstract class mod_command extends command 
{
	static async execute_at_channel(
		command_name: string, 
		op: User, 
		target_user: User, 
		mod_channel: TextBasedChannels,
		target_message: Message,
		full_command: string,
		interaction: ContextMenuInteraction | ButtonInteraction
		)
	{
		const yetkili_komutlari = dcmodule.channel_id.yetkili_komutlari;
		const prefixed_command = `\`${command_name}`;
		const p1 = mod_channel.send({
			content: full_command, 
			embeds: [
				// pass new MessageEmbed() into lambda function. if message has attachments, setImage, else return embed as is
				(x=>target_message.attachments.size === 0 ? x : x.setImage(target_message.attachments.first()!.url))
				(new MessageEmbed()
					.setThumbnail(target_user.avatarURL() ?? target_user.displayAvatarURL())
					.setAuthor(op.username, op.avatarURL() ?? op.displayAvatarURL())
					.setTitle(`${target_user.username} üzerinde \`${prefixed_command}\` komutu çalıştırdı. Mesaja gitmek için tıklayınız`)
					.setDescription(target_message.content)
					.setURL(target_message.url)
				)	
			]
		});
		const p2 = interaction.reply({ content: `${target_user.username} kullanıcısı üzerinde <#${yetkili_komutlari}> kanalında \`${prefixed_command}\` komutu çalıştırıldı.`, ephemeral: true});
		await Promise.all([p1, p2]);
	}
    public data: ContextMenuCommandBuilder;
	
	public constructor(
		command_name: string,
		public permissions: ApplicationCommandPermissionData[] = [
			{ id: dcmodule.role_id_koruyucu, type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
			{ id: dcmodule.role_id_kurucu,   type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
		]
		)
	{
		super(command_name);
		
        this.data = new ContextMenuCommandBuilder()
			.setName(this.command_name)
			.setType(ApplicationCommandType.Message)
			;
		const DEBUG = process.env.DCBOT_DEBUG;
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

			if (!yetkili_komutlari_channel?.isText() 
			 || !target_channel?.isText()) {

				await command.respond_interaction_failure_to_user(interaction);
				return operation.complete;
			}
			const target_message = await target_channel.messages.fetch(interaction.targetId);
			if (!target_message) {

				await command.respond_interaction_failure_to_user(interaction);
				return operation.complete;
			}

			await mod_command.execute_at_channel(
				this.command_name, 
				interaction.user, 
				target_message.author, 
				yetkili_komutlari_channel,
				target_message,
				`\`${this.command_name} ${target_message.author.id}`,
				interaction
				);
		}
		
		return operation.complete;
	}
}