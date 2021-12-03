import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { CardRepository, FakeCardRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";
import { menuOnMessage } from "../../../TpbotDecorators"

export class KartOyunu extends TpbotModule
{
/*******************************************************************72*/
private readonly CardRepository: CardRepository = new FakeCardRepo();
constructor()
{
    super(KartOyunu.name);
}
/*******************************************************************72*/
@menuOnMessage async deste(interaction: CommandInteraction)
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
/*******************************************************************72*/
}