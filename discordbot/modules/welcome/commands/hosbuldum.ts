import { ButtonInteraction, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionTypes, MessageButtonStyles } from "discord.js/typings/enums";
import { command_user_state, dcmodule, known_interactions } from "../../../module";
import { assert } from "console";
import { log } from "../../../log";
import { command } from "../../../command";
import { status, click_interaction, dfa_command } from "../../../command.dfa";

// https://en.wikipedia.org/wiki/Deterministic_finite_automaton
enum Q {
    basla,
    yardim, sohbet, proje, reklam,
    acil, sabirli,
    yazilim, bilgisayar, diger,
    roller, bitir
}
const d : { [key in Q]: Q[] } = {
    [Q.basla] : [Q.yardim, Q.sohbet, Q.proje, Q.reklam],

    [Q.yardim]: [Q.yazilim, Q.bilgisayar, Q.diger],
    [Q.sohbet]: [Q.roller],
    [Q.proje] : [Q.roller],
    [Q.reklam]: [Q.roller],

    [Q.yazilim]   : [Q.acil, Q.sabirli],
    [Q.bilgisayar]: [Q.acil, Q.sabirli],
    [Q.diger]     : [Q.roller],

    [Q.acil]   : [Q.roller],
    [Q.sabirli]: [Q.roller],

    [Q.roller]: [Q.bitir],
    [Q.bitir]: [],
};
const choice_alright = ["Anlaşıldı"];
const choice_thanks  = ["Teşekkürler"];
const choice_topics = [
    "Yazılım ile ilgili",
    "Bilgisayar, donanım, teknik veya bir arıza ile ilgili",
    "Yazılıma başlangıç tavsiyesi, üniversiteler veya başka merak ettiğim bir konu",
];
const choice_priorities = [
    "Durumum acil",
    "Sabırlıyım teşekkürler.",
];
const choice_labels : { [key in Q]: string[] } = {
    [Q.basla]: [
        "Yardıma ihtiyacım var",
        "Sohbet",
        "Proje paylaşmak",
        "Reklam veya partnerlik",
    ],
    
    [Q.yardim]: choice_topics,
    [Q.sohbet]: choice_alright,
    [Q.proje] : choice_alright,
    [Q.reklam]: choice_alright,

    [Q.yazilim]   : choice_priorities,
    [Q.bilgisayar]: choice_priorities,
    [Q.diger]     : choice_alright,

    [Q.acil]   : choice_alright,
    [Q.sabirli]: choice_alright,

    [Q.roller]  : choice_thanks,
    [Q.bitir]  : [],
};
const channel_mentions : { [key in Q]: string } = {
    [Q.basla]: "",
    
    [Q.yardim]: "",
    [Q.sohbet]: "",
    [Q.proje] : `<#${dcmodule.channel_id.proje_paylas}>`,
    [Q.reklam]: `<#${dcmodule.channel_id.istek_oneri_sikayet}>`,

    [Q.yazilim]   : `<#${dcmodule.channel_id.yazilim_sor}>`,
    [Q.bilgisayar]: `<#${dcmodule.channel_id.kodlama_disi_sor}>`,
    [Q.diger]     : `<#${dcmodule.channel_id.kafamda_deli_sorular}>`,

    [Q.acil]   : ``,
    [Q.sabirli]: ``,

    [Q.roller]: `<#${dcmodule.channel_id.roller}> ve <#${dcmodule.channel_id.bir_bak_buraya}>`,
    [Q.bitir]: ``,
};

const holy_title = "Türk Programcılar Discord Sunucusu";
const priority_question = "Durumunuzun aciliyeti var mıdır?";
const priority_response = `Soru sormadan önce lütfen aşağıdakilere önem gösterin. Bu sizin yardım alma sürecinizi bir hayli hızlandıracaktır.`+
"```diff"+`
- "Falan dili bilen var mı?", "Yardım edebilecek var mı?", "Yardım edebilir misiniz?" gibi sorular sormaktansa sorunuzu "Soru Sor" kategorisi altındaki uygun ve müsait kanallarda direk olarak sorabilirsiniz.

# Soruları gelişi güzel sormak veya konu ile ilgili çok az detay vermek cozum surecini uzatabilir

# Kodunuzu, aldığınız hatayı ve ne yapmak istediğinizi detaylı ve anlaşılır bir dil ile belirtin.

# Kodunuzu ekran görüntüsü olarak değil düzgün ve formatlı bir şekilde aldığınız hata ile paylaşın.

# Üstte belirtilen işlemleri yaptıktan sonra sabırla yardım bekleyin. Başka kanallarda "Falan kanaldaki soruya bakar mısınız?" şeklinde mesajlar atmayın.

# Size yardımcı olan kişilere sizde yardımcı olun. Size yönelttikleri sorulara düzgün cevaplar verin. Sizden denemenizi istedikleri şeyleri gerçekten deneyin.
`+"```";

const embed_bodies : { [key in Q]: string } = {

    [Q.basla]: `${holy_title}'na hoşgeldin. 
Sana birkaç sorumuz olacak. 
Bu seni en doğru şekilde hızlı yönlendirebilmemiz için gerekli. 
Ziyaret amacınız aşağıdakilerin hangisine en yakın?`,
    
    [Q.yardim]: "Yasak olan eylemler:```diff"+`
- Baskasinin sinavina girmek ve bu konuda yardim istemek
# Sunucu üyelerini özelden rahatsız etmek\n`+
"```"+"Ne konuda yardıma ihtiyacınız var?",
    [Q.sohbet]: "Birbirimizi motive ettiğimiz, her gün yeni birşeyler öğrenmeye teşvik ettiğimiz sunucumuzda; kodlama yarışmaları ve eğlenceli birçok diğer aktiviteleri de keşvedebilirsin.",
    [Q.proje] : `${holy_title}'nda kendi geliştirdiğiniz projeleri açık kaynaklı, github/gitlab gibi platformlardan olma koşulu ile paylaşabilirsiniz.
Bunun dışındaki paylaşımlara izin verilmemektedir.
${channel_mentions[Q.proje]} kanalından paylaşımınızı yapabilirsiniz.`,
    [Q.reklam]: `Partnerlik veya reklam için ${channel_mentions[Q.reklam]} kanalına mesaj bırakınız. Yetkililier sizinle iletişime geçecektir.`,

    [Q.yazilim]   : `Yazılım soruları için \`SORULAR\` kategorisi altındaki ${channel_mentions[Q.yazilim]} kanalını kullanınız. ` + priority_question,
    [Q.bilgisayar]: `Konu ile ilgili sorunuzu \`SORULAR\` kategorisi altındaki ${channel_mentions[Q.bilgisayar]} kanalına sorunuz. ` + priority_question,
    [Q.diger]     : `Konu ile ilgili sorunuzu \`SORULAR\` kategorisi altındaki ${channel_mentions[Q.diger]} kanalına sorunuz. `,

    [Q.acil]   : priority_response,
    [Q.sabirli]: priority_response,

    [Q.roller]: `Son olarak rol almak için ${channel_mentions[Q.roller]} kanalına`+" gözatmayı unutmayın.",
    [Q.bitir]: " Keyifli bir vakit geçirmeniz dileğiyle.```Onay sistemi sonlandırıldı.```",
}
const images: { [key in Q]: string | undefined} =
{
    [Q.basla]: undefined,

    [Q.yardim]: undefined,
    [Q.sohbet]: "https://cdn.discordapp.com/attachments/851031980250103888/902865735100026910/unknown.png",
    [Q.proje]: "https://cdn.discordapp.com/attachments/851031980250103888/902871153364840458/unknown.png",
    [Q.reklam]: "https://cdn.discordapp.com/attachments/851031980250103888/902865828163244062/unknown.png",

    [Q.yazilim]: "https://cdn.discordapp.com/attachments/851031980250103888/902829309960531989/unknown.png",
    [Q.bilgisayar]: "https://cdn.discordapp.com/attachments/851031980250103888/902833500657426452/unknown.png",
    [Q.diger]     : "https://cdn.discordapp.com/attachments/851031980250103888/902832985542373397/unknown.png",

    [Q.acil]   : undefined,
    [Q.sabirli]: undefined,

    [Q.roller]  : "https://cdn.discordapp.com/attachments/851031980250103888/902905690014769162/unknown.png",
    [Q.bitir]: "https://cdn-longterm.mee6.xyz/plugins/commands/images/698972054740795453/e62465793edaaf32a86f446e22526d715bf02d00cecfdc2b6fbd99e30c603988.gif",
}

// a little assertion that would eliminate headache of unsynchronized d table and state_labels
//
const get_enum_keys = <T extends object>(enum_t : T) : (keyof T)[] => {
    return Object.keys(enum_t) as (keyof T)[];
}
for (const key of get_enum_keys(d)) {
    const expected = d[key].length;
    const actual   = choice_labels[key].length;
    assert(expected == actual);
}
// empty scope
{
    const expected = get_enum_keys(d).length;
    const actual   = get_enum_keys(embed_bodies).length;
    const actual2  = get_enum_keys(choice_labels).length;
    const actual3  = get_enum_keys(channel_mentions).length;
    assert(expected == actual);
    assert(expected == actual2);
    assert(expected == actual3);
}
export const c = new class hosbuldum extends dfa_command<Q>
{

    public constructor()
    {

        const permissions = [
            { id: dcmodule.role_id_tp_uyesi, type: ApplicationCommandPermissionTypes.ROLE, permission: false, },
            { id: dcmodule.role_id_gozalti,  type: ApplicationCommandPermissionTypes.ROLE, permission: false, },
            { id: dcmodule.role_id_kidemli,  type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
            { id: dcmodule.role_id_kurucu,   type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
        ];
        super(
            Object(Q),
            d,
            Q.basla,
            hosbuldum.name, 
            "Türk programcılar onay sistemini başlatır",
            permissions,
            true);
    }

    public async get_choice_index(interaction: click_interaction)
    {
        if (interaction instanceof ButtonInteraction) {
            const n = this.get_choice_from_custom_id(interaction.customId);
            if (n !== undefined)
                return n;

            await this.log_and_reply_user(`customId[${interaction.customId}] is not a number`, interaction);
        }
        return undefined;
    }
    public async process_new_state(new_q: Q, old_q: Q, i: Q | null, interaction: known_interactions): Promise<status>
    {
        // prepare user interface
        const question = embed_bodies[new_q];
        const choices  = choice_labels[new_q];

        let buttons = new MessageActionRow()
            .addComponents(
                choices.map((x, i) => new MessageButton().setCustomId(i+"").setLabel(x).setStyle(MessageButtonStyles.PRIMARY))
            );

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setDescription(question);

        const image_path = images[new_q];
        if (image_path !== undefined) {
            if (new_q == Q.bitir)
                embed.setThumbnail(image_path);
            else
                embed.setImage(image_path);
        }

        // if its beginning, send panel as reply
        if (new_q == Q.basla) {
            const response = { ephemeral: true, embeds: [embed], components: [buttons] };
            await interaction.reply(response);
        }
        // if its not beginning, send panel as update
        else {
            interaction = interaction as ButtonInteraction;
            const response = { embeds: [embed], components: choices.length == 0 ? [] : [buttons]};
            await interaction.update(response);
        }
        (async (_i) => {
            const cid = process.env.DCBOT_DEBUG !== undefined
                ? dcmodule.channel_id.tpbot_test_odasi
                : dcmodule.channel_id.sicardo_nvidia
                ;
            const channel = await interaction.guild?.channels.fetch(cid);
            if (channel?.isText()) {
                const user = command.get_user_info(interaction.user)
                const msg = _i !== null
                    ? "```css\n"+`[${user.name}] seçenek seçti [${choice_labels[old_q][_i]}] id=${user.id} `+"```"
                    : "```css\n"+`[${user.name}] #hosbuldum komutunu başlattı.  id=${user.id}`+"```"
                    ;
                await channel.send(msg);
            }
        })(i);

        // if its end, give user the role
        if (new_q == Q.bitir) {
            // give user role
            const guild_user = await interaction.guild?.members.fetch(interaction.user);
            if (!guild_user) {
                this.log.error("Can't fetch guild user at the end of hosbuldum command", command.get_user_info(interaction.user));
                return status.finished;
            }
            await guild_user.roles.add(dcmodule.role_id_tp_uyesi);
            return status.finished;
        }
        return status.in_progress;
    }
}