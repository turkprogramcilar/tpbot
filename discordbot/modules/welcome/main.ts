import { Guild, GuildMember, Message, MessageEmbed } from "discord.js";
import { modern } from "../../modern";
import { dcmodule } from "../../module";
export const m = new class welcome extends modern {
    
    constructor() { super(welcome.name, false); }

    protected async on_guild_member_add(member: GuildMember) 
    {
        const channel_id = process.env.DCBOT_DEBUG
            ? dcmodule.channel_id.tpbot_test_odasi
            : dcmodule.channel_id.sohbet
            ;
        
        const channel = await member.guild.channels.fetch(channel_id);
        if (!channel) {
            this.log.warn("Can't fetch channel for welcome message");
            return;
        }
        if (!channel.isText()) {
            this.log.warn("Given channel is not text channel.");
            return;
        }
        channel.send({embeds: [new MessageEmbed()
            /* @WARN following ! will cause error if guild icon is undefined */
            .setAuthor(member.user.username, member.avatarURL() ?? member.displayAvatarURL())
            .setThumbnail("https://media1.giphy.com/media/KSrNm2ThozpYnh3abh/giphy.gif")
            .setDescription(`YIHAHO <@${member.id}>, **Türk Programcılar** discord sunucusuna hoşgeldin!`)
            .setImage("https://media4.giphy.com/media/mTTuI8qkiXMtVjjqmq/giphy.gif")
            /*.setAuthor(op.username, op.avatarURL() ?? op.displayAvatarURL())
            .setTitle(`${target_user.username} üzerinde \`${mod_command}\` komutu çalıştırdı. Mesaja gitmek için tıklayınız`)
            .setDescription(target_message.content)
            .setURL(target_message.url)*/
        ]});
    }
    protected async on_guild_member_remove(member: GuildMember)
    {
        const channel_id = process.env.DCBOT_DEBUG
            ? dcmodule.channel_id.tpbot_test_odasi
            : dcmodule.channel_id.sicardo_nvidia
            ;
        
        const channel = await member.guild.channels.fetch(channel_id);
        if (!channel) {
            this.log.warn("Can't fetch channel for welcome message");
            return;
        }
        if (!channel.isText()) {
            this.log.warn("Given channel is not text channel.");
            return;
        }
        channel.send(`**${member.user.username}** sunucudan çıktı.`
            + ` \`[${member.user.tag} id=${member.user.id}]\``);
    }
}