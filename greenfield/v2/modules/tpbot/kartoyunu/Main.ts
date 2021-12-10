import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Message, MessageActionRow, MessageButton, MessageComponent, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { TpbotModule } from "../../../TpbotModule";
import { KartOyunuRepository, FakeRepo } from "./CardRepository";
import { CardTextDatabase } from "./CardTextDatabase";
import { CustomId, CustomIdRegex, MessageCommand, SlashCommand, UserCommand } from "../../../TpbotDecorators"
import { bold, codeBlock, inlineCode, italic, underscore } from "@discordjs/builders";
import { CardNo, CardPlayKind, CardRarity, CardTitle } from "./CardProperties";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { CardEffectDatabase } from "./CardEffectDatabase";
import { Helper } from "../../../common/Helper";
import { CardDatabase } from "./CardDatabase";
import { CardUser } from "./CardUser";

export class KartOyunu extends TpbotModule
{
static rollCard(rnd: (() => number) = Math.random): CardNo
{
    const groupedByRarity = 
            Array(Object.keys(CardTitle).length / 2).fill(0).map((x, _i) => _i+1)
            .reduce((a: number[][], c) => { 
                const aa = a[CardTextDatabase[c as CardNo].rarity];
                aa.push(c); 
                return a; 
            }, [[],[],[],[],[]]);

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
publicEcho: [string, string][] = [];

private readonly CardRepository: KartOyunuRepository = new CardDatabase();// new FakeCardRepo();
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
async directMessage(message: Message)
{
    const index = this.publicEcho.findIndex(x => x[0] === message.author.id);
    if (-1 !== index) {

        const [userId, channelId] = this.publicEcho[index];
        this.publicEcho.splice(index, 1);

        let send: string = italic(underscore(message.content) + 
            " -" + message.author.username);
        if (send.length > 2000) {
            const clip = send.length - 2000;
            send = italic(underscore(message.content.slice(clip)) +
            " -" + message.author.username);
        }

        await this.channelSend(channelId, send);
        return;
    }
}
deckPanel(deck: CardNo[], customId: string)
{
    if (deck.length <= 0)
        return [ new MessageActionRow().addComponents([
            new MessageButton()
            .setCustomId("ignorethis")
            .setStyle(MessageButtonStyles.SECONDARY)
            .setDisabled(true)
            .setLabel("Destede hiç kart yok.")
        ])];
    // @TODO slice 25 limited hardcoded
    const menuCards = deck.slice(0, 25).map((x, i) => { return {
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
            // .setDisabled(true)
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
    const daily = (await this.CardRepository.checkDoDaily(interaction.user.id))
        ? codeBlock("diff", "+ Günlük yeni 2 kart hakkın destene eklendi.")
        : ""
        ;
    // @TODO
    // const deck = (await this.CardRepository.getSlashDeck(interaction.user.id));
    const deck = (await this.CardRepository.getDeck(interaction.user.id));
    await interaction.reply({content: daily+"Destendeki normal kartlar:", 
        components: this.deckPanel(deck, "normal"), ephemeral: true});
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
            
    const target = this.selectedTarget[interaction.user.id];
    if (effect.playKind === CardPlayKind.Hedefe && !target)
        return;
    
    // @TODO we only allow non-targeted for now
    if (effect.playKind !== CardPlayKind.Ortaya)
        return;

    // gosterilcekse kart goster
    // kart panelini guncelle
    // kart oynandi de
    // karti oyna ve repodan dus
    // target efektini koy
    // general effekti koy
    if (!(await this.CardRepository.playCard(interaction.user.id, no)))
        return;

    // @TODO undefined CardUser, define getUser from repo
    const result = CardEffectDatabase[no]?.execute(this, new CardUser(""));

    await Promise.all([
        // show off
        interaction.channel?.send({content: inlineCode(
            interaction.user.username + " bir kart oynadı."),
            embeds: this.cardShowOff(no)}),
        // update interaction and remove panel
        interaction.update({content:"Kart oynandı", embeds:[], components:[]}),
        // do card effect if any
        result?.effectInteraction?.(interaction)
    ]);
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