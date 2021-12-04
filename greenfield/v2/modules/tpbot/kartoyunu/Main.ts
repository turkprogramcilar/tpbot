import { CommandInteraction, Message, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { CardRepository, FakeCardRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";
import { MessageCommand, SlashCommand, UserCommand } from "../../../TpbotDecorators"
import { bold, codeBlock, inlineCode } from "@discordjs/builders";
import { CardNo, CardRarity, CardTitle } from "./CardProperties";
import { Helper } from "../../../common/Helper";

export class KartOyunu extends TpbotModule
{
/*******************************************************************72*/
private readonly CardRepository: CardRepository = new FakeCardRepo();
constructor()
{
    super(KartOyunu.name);
}
cardEmbeds(no: CardNo)
{
    const colors: {[key in CardRarity]: readonly[number,number,number] } = {
        1: [88,  110, 117],
        2: [131, 148, 150],
        3: [42,  161, 152],
        4: [181, 137, 0],
        5: [203, 75,  22]
    }
    const formats: {[key in CardRarity]: string} =  {
        1: "brainfuck",
        2: "",
        3: "yaml",
        4: "fix",
        5: "css"
    }
    const card = CardTextDatabase[no];
    return [
        new MessageEmbed()
            .setColor(colors[card.rarity])
            .setTitle((card.title))
            .setImage(card.link)
            .setFooter(card.description)
        ,
        new MessageEmbed()
            .setColor(colors[card.rarity])
            .addField(bold("Tür"), codeBlock(formats[card.rarity], 
                `[${card.rarityText}]`), true)
            .addField(bold("Sınıf"), codeBlock(`${card.categoryText}`), true)
            .addField(bold("No"), codeBlock(`${card.no.toString()}`), true)
    ]
}
/*******************************************************************72*/
@UserCommand
async deste(interaction: CommandInteraction)
{
    const deck = (await this.CardRepository.getDeck(interaction.user.id))
        .map((x, i) => { return {
            label: CardTextDatabase[x].title, 
            value: i.toString()
        };
    })
    await interaction.reply({content: "`Destendeki kartlar`", components: [
        new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId("menu")
            .setPlaceholder("Kart seç")
            .addOptions(deck)
        )
    ]});
}
@SlashCommand("Test")
async test(interaction: CommandInteraction)
{
    await interaction.reply({embeds: this.cardEmbeds(1)})
    await Promise.all(Array(30-1).fill(0).map(async (x, i) => {
        await interaction.channel?.send({embeds: this.cardEmbeds(i+2)})
        await Helper.sleep(1000);
    }));
}
/*******************************************************************72*/
}