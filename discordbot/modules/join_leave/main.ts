import { Message, MessageEmbed, GuildMember, Interaction, ButtonInteraction, GuildMemberRoleManager, MessageActionRow, MessageButton } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { mod_command } from "../../command.mod";
import { dcmodule } from "../../module";

export const m = new class join_leave extends dcmodule
{
    private spam_flag = false;

    constructor() { super(join_leave.name, false); }

    /* events */
    protected async on_message(message: Message)
    {
        if (message.channelId !== dcmodule.channel_id.onay
         || message.author.bot)
            return;

        const msg = {
            content: "Türk Programcılar Discord sunucusuna hoşgeldiniz."
            + " Onay sistemini başlatmak için kanala **/hosbuldum** yazınız."
            + " Sistem sizi otomatik kabul edecektir."
            + " _(Mesaj kendini 60 saniye içerisinde imha edecektir)_",
            embeds: [
                new MessageEmbed().setImage("https://cdn.discordapp.com/attachments/900650376762626078/905845292061048832/hosbuldum_komutu.gif")
            ]};

        try {
            await (await message.author.createDM()).send(msg);

        } catch {

            if (!this.spam_flag) {
                this.spam_flag = true;
            
                const reply = await message.reply(msg);
                setTimeout(async () => {
    
                    await reply.delete()
                    this.spam_flag = false;
    
                }, 60000);
            }
        }

        await message.delete();
    }
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

        await channel.send({
            content: `**${member.user.username}** sunucudan çıktı.`
            + ` \`[${member.user.tag} id=${member.user.id}]\``,
            components: this.get_buttons([0, 1, 2])
        });
    }
    protected async on_interaction_create(interaction: Interaction)
    {
        const button_interaction = interaction as ButtonInteraction;
        if (!button_interaction
         ||  button_interaction.guild === null
         || !button_interaction.channel?.isText()
         || !button_interaction.customId.includes(this.module_name))
            return;

        const message = button_interaction.message;
        if (!message)
            return;

        const get_button_id = (customId: string): number => Number((customId.match(/^.+(\d)+$/) ?? [])[1]);
        const button = get_button_id(button_interaction.customId);
        if (isNaN(button))
            return;

        const is_mod = (button_interaction.member?.roles as GuildMemberRoleManager)
            ?.cache.hasAny(dcmodule.role_id_koruyucu, dcmodule.role_id_kurucu);
        
        if (button === 2 && !is_mod)
            return;

        const id = (message.content.match(/^.+\[.*id=(\d+)\]`$/) ?? [])[1];
        if (!id)
            return;


        if (!(message instanceof Message))
            return;

        const p2 = message.edit(
            ((options: any) => {
                const res = this.get_buttons(
                    message.components[0].components
                        .map(x => get_button_id(x.customId ?? ""))
                        .filter(x => !isNaN(x) && x !== button)
                );
                if (res[0].components.length !== 0)
                    options.components = res;
                else
                    options.components = [];
                return options;
            })({ content: message.content })
        );
        const p3 = this.handle_button_click(button, message, id, button_interaction);
        await Promise.all([p2, p3]);
    }
    /* methods */
    private async handle_button_click(button: number, message: Message, id: string, interaction: ButtonInteraction)
    {
        const ok = () => interaction.reply({content: "Görev tamam.", ephemeral: true});
        switch (button) {
        case 0: await ok(); await message.reply("https://tenor.com/view/ricardo-milos-meme-laser-gif-13923814"); break;
        case 1: await ok(); await message.reply("https://tenor.com/view/linus-linus-torvalds-nvidia-fuck-you-gif-18053606"); break;
        case 2:

            const mod_channel = await interaction.guild?.channels.fetch(dcmodule.channel_id.yetkili_komutlari)
            if (!mod_channel
             || !mod_channel.isText()) {
                this.log.error("Can't fetch mod channel");
                return;
             }
            
            if (!(interaction.message instanceof Message)) {
                this.log.error("Interaction is not instance of Message");
                return;
            }

            const target_user = await this.get_client().users.fetch(id);
            await mod_command.execute_at_channel(
                `acustody`,
                interaction.user,
                target_user,
                mod_channel,
                interaction.message,
                `.acustody ${id}`,
                interaction
                );
            break;
        default:
            this.log.warn("Unexpected interaction id: "+button);
            return;
        }
    }
    private get_buttons(which: number[])
    {
        return [
            new MessageActionRow().addComponents(
                ...[new MessageButton()
                    .setCustomId(this.module_name+"0")
                    .setStyle(MessageButtonStyles.SECONDARY)
                    .setLabel("Sicardo"),
                new MessageButton()
                    .setCustomId(this.module_name+"1")
                    .setStyle(MessageButtonStyles.SECONDARY)
                    .setLabel("Nvidia"),
                new MessageButton()
                    .setCustomId(this.module_name+"2")
                    .setStyle(MessageButtonStyles.DANGER)
                    .setLabel("Gözaltı")].filter((x, i) => which.includes(i))
            )
        ]
    }
}()