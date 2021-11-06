import { GuildMember, MessageEmbed } from "discord.js";
import { commander } from "../../commander";
import { dcmodule } from "../../module";
export const m = new class welcome extends commander {
    
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
        await new Promise(x => setTimeout(x, 5000));
        await channel.send({embeds: [new MessageEmbed()
            .setAuthor(member.user.username, member.avatarURL() ?? member.displayAvatarURL())
            .setThumbnail("https://media1.giphy.com/media/KSrNm2ThozpYnh3abh/giphy.gif")
            .setDescription(`YIHAHO <@${member.id}>, **Türk Programcılar** discord sunucusuna hoşgeldin!`)
            .setImage("https://media4.giphy.com/media/mTTuI8qkiXMtVjjqmq/giphy.gif")
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
        await channel.send(`**${member.user.username}** sunucudan çıktı.`
            + ` \`[${member.user.tag} id=${member.user.id}]\``);
    }
}()