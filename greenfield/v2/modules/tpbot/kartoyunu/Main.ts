import { Message, MessageActionRow, MessageSelectMenu } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { CardRepository, FakeCardRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";
import { command } from "../../../TpbotDecorators"

export class KartOyunu extends TpbotModule
{
/*******************************************************************72*/
private readonly CardRepository: CardRepository = new FakeCardRepo();
constructor()
{
    super(KartOyunu.name);
}
/*******************************************************************72*/
@command() async deste(message: Message)
{
    const deck = (await this.CardRepository.getDeck("")).map((x, i) => {
        return {
            label: CardTextDatabase[x].title, 
            value: i.toString()
        };
    })
    await message.reply({content: "`Destendeki kartlar`", components: [
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