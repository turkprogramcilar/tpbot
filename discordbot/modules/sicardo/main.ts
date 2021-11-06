import { ButtonInteraction, Client, Guild, GuildMemberRoleManager, Interaction, Message, MessageActionRow, MessageButton, MessageReaction, PartialUser, Presence, TextBasedChannels, TextChannel, User } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { mod_command } from "../../command.mod";
import { commander } from "../../commander";
import { dcmodule } from "../../module";

export const m = new class sicardo extends dcmodule {
    
    constructor() { super(sicardo.name); }
    /* methods */
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
    /* events */
    public async on_message(msg: Message)
    {
        if (msg.author.id === this.get_client().user?.id
         || msg.author.id !== "824573651390562325"
         || msg.channelId != dcmodule.channel_id.tpbot_test_odasi)
            return;

        if (!(msg.channel instanceof TextChannel))
            return;

        msg.channel.send({
            content: 
                "𝓩𝓪𝓯𝓮𝓻𝓼54 sunucudan çıktı. `[𝓩𝓪𝓯𝓮𝓻𝓼54#2325 id=890463210799501322]`",
            components: this.get_buttons([0, 1, 2])
        });
    }
    public async on_interaction_create(interaction: Interaction)
    {
        if (interaction.guild == null
         || !interaction.channel?.isText()
         || !(interaction instanceof ButtonInteraction)
         || !interaction.customId.includes(this.module_name))
            return;

        const get_button_id = (customId: string): number => Number((customId.match(/^.+(\d)+$/) ?? [])[1]);
        const button = get_button_id(interaction.customId);
        if (button === NaN)
            return;

        const is_mod = (interaction.member?.roles as GuildMemberRoleManager)
            ?.cache.hasAny(dcmodule.role_id_koruyucu, dcmodule.role_id_kurucu);
        
        if (button == 2 && !is_mod)
            return;

        const id = (interaction.message.content.match(/^.+\[.*id=(\d+)\]`$/) ?? [])[1];
        if (!id)
            return;


        if (!(interaction.message instanceof Message))
            return;

        const p2 = interaction.message.edit(
            ((x: any) => {
                const res = this.get_buttons(
                    interaction.message.components[0].components
                        .map(x => get_button_id(x.customId ?? ""))
                        .filter(x => x != NaN && x != button)
                );
                if (res[0].components.length != 0)
                    x.components = res;
                else
                    x.components = [];
                return x;
            })({ content: interaction.message.content })
        );
        const p3 = this.handle_button_click(button, interaction.message, id, interaction);
        await p2, p3;
    }
    /* methods */
    public async handle_button_click(button: number, message: Message, id: string, interaction: ButtonInteraction)
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
}();