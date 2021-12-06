import { CommandInteraction, ContextMenuInteraction, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { CardRepository, FakeCardRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";
import { CustomIdRegex, MessageCommand, SlashCommand, UserCommand } from "../../../TpbotDecorators"
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
deckPanel(deck: CardNo[], customId: string)
{
    const menuCards = deck.map((x, i) => { return {
        label: CardTextDatabase[x].title, 
        value: i.toString()
    }});
    return [
        new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder("Kart seç")
            .addOptions(menuCards)
        )
    ];
}
cardEmbed(no: CardNo)
{
    const colors: {[key in CardRarity]: readonly[number,number,number] } = {
        [CardRarity.Yaygın]:     [88,  110, 117],
        [CardRarity.Güzide]:     [131, 148, 150],
        [CardRarity.Esrarengiz]: [42,  161, 152],
        [CardRarity.İhtişamlı]:  [181, 137, 0],
        [CardRarity.Destansı]:   [203, 75,  22]
    }
    const formats: {[key in CardRarity]: string} =  {
        [CardRarity.Yaygın]:     "brainfuck",
        [CardRarity.Güzide]:     "",
        [CardRarity.Esrarengiz]: "yaml",
        [CardRarity.İhtişamlı]:  "fix",
        [CardRarity.Destansı]:   "css"
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
private rollCard(rnd: (() => number) = Math.random): CardNo
{
    const groupedByRarity = 
            Array(Object.keys(CardTitle).length / 2).fill(0).map((x, i) => i+1)
            .reduce((a: number[][], c) => { 
                a[CardTextDatabase[c as CardNo].rarity-1].push(c); 
                return a; 
            }, [[],[],[],[],[]/* excluded group: -> */,[]])
            .slice(0, -1);

    const rollScale = groupedByRarity
            .map((x, i) => x.length/(i+1));
    const sum = rollScale.reduce((a, c) => a+=c, 0);
    const roll = rnd() * sum;
    let s = rollScale[0];
    let i = 0;
    for (; roll >= s; i++) {
        s += rollScale[i+1];
    }
    const group = groupedByRarity[i];
    return group[Math.floor(rnd() * group.length)];
}
/*******************************************************************72*/
@MessageCommand
async hedef(interaction: ContextMenuInteraction)
{
    const message = await interaction.channel?.messages.fetch(interaction.targetId);
    if (!message) {
        this.print.error("Can't fetch message");
        return;
    }
    const deck = (await this.CardRepository.getUserDeck(interaction.user.id));
    await interaction.reply({content: 
        `Hedef: ${inlineCode(message.author.username)}`
        + `\nDestendeki hedefli kartlar:`, components:
        this.deckPanel(deck, message.author.id), ephemeral: true});
}
@SlashCommand("Normal kart destesini açar")
async deste(interaction: CommandInteraction)
{
    const deck = (await this.CardRepository.getSlashDeck(interaction.user.id));
    await interaction.reply({content: "Destendeki normal kartlar:", components:
        this.deckPanel(deck, "normal"), ephemeral: true});
}
@CustomIdRegex(/normal/)
async normal(interaction: SelectMenuInteraction)
{
    const no = Number(interaction.values[0])+1;
    await interaction.update({embeds: this.cardEmbed(no)});    
}
/*
@SlashCommand("Test")
async test2(interaction: CommandInteraction)
{
    await interaction.reply({embeds: this.cardEmbeds(this.rollCard())})
    for (const i of [...Array(62).keys()]) {
        const card = this.cardEmbeds(i+1);
        await Helper.sleep(1000);
        await interaction.channel?.send({embeds:card});
    }
}
@SlashCommand("Test")
async test(interaction: CommandInteraction)
{
	await interaction.deferReply();

    let min = 1000;
    let max = 0;
    let cardsDrawn: any = {}
    for (let i = 0; i < 1000000; i++)
    {
        const t = this.rollCard();
        if (t > max)
            max = t;
        else if (t < min)
            min = t;
        if (!cardsDrawn[t])
            cardsDrawn[t] = 1;
        else
            cardsDrawn[t]++;
    }
    let t = 0;
    const rarityPerDrawn: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    const cardsPerRarity: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
    const per: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
    
    const perCard: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
    for (const [key, value] of Object.entries(cardsDrawn))
    {
        const cardNo = Number(key);
        const rarity = CardTextDatabase[cardNo as CardNo].rarity;
        cardsPerRarity[rarity]++;
        rarityPerDrawn[rarity] += Number(value);
        t += Number(value);
    }
    for (const i of [...Array(5).keys()]) {

        const ii = (i+1) as CardRarity;
        per[ii] = rarityPerDrawn[ii] / t 
        perCard[ii] = rarityPerDrawn[ii] / t / cardsPerRarity[ii] 
    }
    await interaction.editReply(`min:${min} max:${max} total: ${t} `
        + `rarityPerDrawn: ${codeBlock(JSON.stringify(rarityPerDrawn))}`
        + `cardsPerRarity: ${codeBlock(JSON.stringify(cardsPerRarity))}`
        + `per: ${codeBlock(JSON.stringify(per))}`
        + `perCard: ${codeBlock(JSON.stringify(perCard))}`
    );
}
/*******************************************************************72*/
}