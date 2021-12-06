import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Message, MessageActionRow, MessageButton, MessageComponent, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { CardRepository, FakeCardRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";
import { CustomId, CustomIdRegex, MessageCommand, SlashCommand, UserCommand } from "../../../TpbotDecorators"
import { bold, codeBlock, inlineCode } from "@discordjs/builders";
import { CardNo, CardRarity, CardTitle } from "./CardProperties";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { CardEffectDatabase } from "./CardEffectDatabase";
import { Helper } from "../../../common/Helper";
import { CardDatabase } from "./CardDatabase";

export class KartOyunu extends TpbotModule
{
static rollCard(rnd: (() => number) = Math.random): CardNo
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
private readonly CardRepository: CardRepository = new CardDatabase();//new FakeCardRepo();
private readonly selectedCard: {[key: string]: CardNo | undefined} = {};
private readonly selectedTarget: {[key: string]: string | undefined} = {};
private readonly colors: {[key in CardRarity]: readonly[number,number,number] } = {
    [CardRarity.Yaygın]:     [88,  110, 117],
    [CardRarity.Güzide]:     [131, 148, 150],
    [CardRarity.Esrarengiz]: [42,  161, 152],
    [CardRarity.İhtişamlı]:  [181, 137, 0],
    [CardRarity.Destansı]:   [203, 75,  22]
}
private readonly formats: {[key in CardRarity]: string} =  {
    [CardRarity.Yaygın]:     "brainfuck",
    [CardRarity.Güzide]:     "",
    [CardRarity.Esrarengiz]: "yaml",
    [CardRarity.İhtişamlı]:  "fix",
    [CardRarity.Destansı]:   "css"
}
constructor()
{
    super(KartOyunu.name);
}
deckPanel(deck: CardNo[], customId: string)
{
    const menuCards = deck.map((x, i) => { return {
        label: CardTextDatabase[x].title, 
        value: `${i}_${x.toString()}`
    }});
    return [
        new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId(customId+"menu")
            .setPlaceholder("Kart seç")
            .addOptions(menuCards),
        )
        ,
        new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId(customId+"button")
            .setLabel("Kart oyna")
            .setStyle(MessageButtonStyles.PRIMARY)
            .setDisabled(true)
        )
    ];
}
cardShowOff(no: CardNo)
{
    const card = CardTextDatabase[no];
    return [ new MessageEmbed()
        .setThumbnail(card.link)
        .setTitle(inlineCode(card.title))
        .setDescription(codeBlock(this.formats[card.rarity], `[${card.description}]`))
        .addField(inlineCode(`Kart cinsi: ${card.rarityText}`), `No: ${no}\n\n\n`)
        .setColor(this.colors[card.rarity])
    ];
}

cardEmbed(no: CardNo)
{
    const card = CardTextDatabase[no];
    return [
        new MessageEmbed()
            .setColor(this.colors[card.rarity])
            .setTitle((card.title))
            .setImage(card.link)
            .setFooter(card.description)
        ,
        new MessageEmbed()
            .setColor(this.colors[card.rarity])
            .addField(bold("Tür"), codeBlock(this.formats[card.rarity], 
                `[${card.rarityText}]`), true)
            .addField(bold("Sınıf"), codeBlock(`${card.categoryText}`), true)
            .addField(bold("No"), codeBlock(`${card.no.toString()}`), true)
    ];
}
/*******************************************************************72*/
// @MessageCommand
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
    this.selectedCard[interaction.user.id] = undefined;
    this.selectedTarget[interaction.user.id] = message.author.id;
}
@SlashCommand("Normal kart destesini açar")
async deste(interaction: CommandInteraction)
{
    const deck = (await this.CardRepository.getSlashDeck(interaction.user.id));
    await interaction.reply({content: "Destendeki normal kartlar:", components:
        this.deckPanel(deck, "normal"), ephemeral: true});
    this.selectedCard[interaction.user.id] = undefined;
}
@CustomId
async normalmenu(interaction: SelectMenuInteraction)
{
    const match = interaction.values[0].match(/\d+\_(\d+)/);
    const no = Number(match?.[1]);
    if (isNaN(no))
        return;
    this.selectedCard[interaction.user.id] = no;
    await interaction.update({embeds: this.cardEmbed(no)});    
}
@CustomId
async normalbutton(interaction: ButtonInteraction)
{
    const no = this.selectedCard[interaction.user.id];
    if (!no)
        return;

    const effect = CardEffectDatabase[no];
    if (!effect)
        return interaction.update(codeBlock("diff",
            "- Kart şu anda sadece koleksiyonda tutulabilmektedir."));
            
    const hasTarget = effect?.hasTarget;
    const target = this.selectedTarget[interaction.user.id];
    if (hasTarget && !target)
        return;
    
    // gosterilcekse kart goster
    // kart panelini guncelle
    // kart oynandi de
    // karti oyna ve repodan dus
    // target efektini koy
    // general effekti koy
    if (await this.CardRepository.playCard(interaction.user.id, no))
        await Promise.all([
            interaction.channel?.send({content: inlineCode(
                interaction.user.username + " bir kart oynadı."),
                embeds: this.cardShowOff(no)}),
            interaction.update({content:"Kart oynandı", embeds:[], components:[]})
        ]);
    else
        return;
}
// @SlashCommand("Test")
async test2(interaction: CommandInteraction)
{
    await interaction.reply({embeds: this.cardEmbed(KartOyunu.rollCard())})
    for (const i of [...Array(62).keys()]) {
        const card = this.cardEmbed(i+1);
        await Helper.sleep(1000);
        await interaction.channel?.send({embeds:card});
    }
}
// @SlashCommand("Test")
async test(interaction: CommandInteraction)
{
	await interaction.deferReply();

    let min = 1000;
    let max = 0;
    const cardsDrawn: any = {}
    for (let i = 0; i < 1000000; i++)
    {
        const t = KartOyunu.rollCard();
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
        1: 0, 2: 0, 3: 0, 4: 0, 0: 0
    };
    const cardsPerRarity: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 0: 0
    }
    const per: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 0: 0
    }
    
    const perCard: {[key in CardRarity]: number} = {
        1: 0, 2: 0, 3: 0, 4: 0, 0: 0
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