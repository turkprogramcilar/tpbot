import { Client, Message, MessageActionRow, MessageSelectMenu } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { CardRepository, FakeCardRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";

export class KartOyunu extends TpbotModule
{
/*******************************************************************72*/
private readonly CardRepository: CardRepository = new FakeCardRepo();
constructor()
{
    super(KartOyunu.name);
}
/*******************************************************************72*/
async textMessage(message: Message)
{
    await this.$$(message, [
        [/deste/, async _ => {
            const deck = (await this.CardRepository.getDeck("")).map((x, i) => {
                return {
                    label: CardTextDatabase[x].title, 
                    value: i.toString()
                };
            })
            await message.reply({components: [
                new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setPlaceholder("Destendeki kartlar:")
                    .addOptions(deck)
                )
            ]});
        }],
    ]);
}
/*******************************************************************72*/
}