import { ButtonInteraction, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionTypes, MessageButtonStyles } from "discord.js/typings/enums";
import { command_user_state, dcmodule } from "../../../module";
import { assert } from "console";
import { log } from "../../../log";

const module_name = "hosbuldum";

export const data = new SlashCommandBuilder()
    .setName(module_name)
    .setDescription('Türk programcılar onay sistemini başlatır')
    .setDefaultPermission(true);

export const permissions = [
    { id: dcmodule.role_id_tp_uyesi,    type: ApplicationCommandPermissionTypes.ROLE, permission: false, },
    { id: dcmodule.role_id_kidemli,     type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
    { id: dcmodule.role_id_kurucu,      type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
];

// https://en.wikipedia.org/wiki/Deterministic_finite_automaton
enum Q {
    basla,
    yardim, sohbet, proje, reklam,
    acil, sabirli,
    yazilim, bilgisayar, diger,
    bitir,
}
const d : { [key in Q]: Q[] } = {
    [Q.basla] : [Q.yardim, Q.sohbet, Q.proje, Q.reklam],

    [Q.yardim]: [Q.yazilim, Q.bilgisayar, Q.diger],
    [Q.sohbet]: [Q.bitir],
    [Q.proje] : [Q.bitir],
    [Q.reklam]: [Q.bitir],

    [Q.yazilim]   : [Q.acil, Q.sabirli],
    [Q.bilgisayar]: [Q.acil, Q.sabirli],
    [Q.diger]     : [Q.bitir],

    [Q.acil]   : [Q.bitir],
    [Q.sabirli]: [Q.bitir],

    [Q.bitir]: [],
};
const label_bitir = ["Teşekkürler"];
const label_topics = [
    "Yazılım ile ilgili",
    "Bilgisayar, donanım, teknik veya bir arıza ile ilgili",
    "Yazılıma başlangıç tavsiyesi, üniversiteler veya başka merak ettiğim bir konu",
];
const label_priorities = [
    "Durumum acil",
    "Sabırlıyım teşekkürler.",
];
const state_choices : { [key in Q]: string[] } = {
    [Q.basla]: [
        "Yardıma ihtiyacım var",
        "Sohbet",
        "Proje paylaşmak",
        "Reklam veya partnerlik",
    ],
    
    [Q.yardim]: label_topics,
    [Q.sohbet]: label_bitir,
    [Q.proje] : label_bitir,
    [Q.reklam]: label_bitir,

    [Q.yazilim]   : label_priorities,
    [Q.bilgisayar]: label_priorities,
    [Q.diger]     : label_bitir,

    [Q.acil]   : label_bitir,
    [Q.sabirli]: label_bitir,

    [Q.bitir]  : [],
};
const state_channel : { [key in Q]: string } = {
    [Q.basla]: "",
    
    [Q.yardim]: "",
    [Q.sohbet]: "",
    [Q.proje] : `<#${dcmodule.channel_id.proje_paylas}>`,
    [Q.reklam]: `<#${dcmodule.channel_id.istek_oneri_sikayet}>`,

    [Q.yazilim]   : `<#${dcmodule.channel_id.yazilim_sor}>`,
    [Q.bilgisayar]: `<#${dcmodule.channel_id.kodlama_disi_sor}>`,
    [Q.diger]     : `<#${dcmodule.channel_id.kafamda_deli_sorular}>`,

    [Q.acil]   : `<#${dcmodule.channel_id.bir_bak_buraya}>`,
    [Q.sabirli]: `<#${dcmodule.channel_id.bir_bak_buraya}>`,

    [Q.bitir]  : `<#${dcmodule.channel_id.bir_bak_buraya}>`,
};
const holy_title = "Türk Programcılar Discord Sunucusu";
const priority_question = "Durumunuzun aciliyeti var mıdır?";
const priority_response = `Soru sormadan önce ${state_channel[Q.acil]} kanalındaki \`YARDIM ISTERKEN\` kısmınızı okumanız gerekmektedir. Bu sizin yardım alma sürecinizi bir hayli hızlandıracaktır.`;
const state_question : { [key in Q]: string } = {
    [Q.basla]: `${holy_title}'na hoşgeldin. 
Sana birkaç sorumuz olacak. 
Bu seni en doğru şekilde hızlı yönlendirebilmemiz için gerekli. 
Ziyaret amacınız aşağıdakilerin hangisine en yakın?`,
    
    [Q.yardim]: "Ne konuda yardıma ihtiyacınız var?",
    [Q.sohbet]: "Birbirimizi motive ettiğimiz, her gün yeni birşeyler öğrenmeye teşvik ettiğimiz sunucumuzda; kodlama yarışmaları ve eğlenceli birçok diğer aktiviteleri de keşvedebilirsin.",
    [Q.proje] : `${holy_title}'nda kendi geliştirdiğiniz projeleri açık kaynaklı, github/gitlab gibi platformlardan olma koşulu ile paylaşabilirsiniz.
Bunun dışındaki paylaşımlara izin verilmemektedir.
${state_channel[Q.proje]} kanalından paylaşımınızı yapabilirsiniz.`,
    [Q.reklam]: `Partnerlik veya reklam için ${state_channel[Q.reklam]} kanalına mesaj bırakınız. Yetkililier sizinle iletişime geçecektir.`,

    [Q.yazilim]   : `Yazılım soruları için \`SORULAR\` kategorisi altındaki ${state_channel[Q.yazilim]} kanalını kullanınız. ` + priority_question,
    [Q.bilgisayar]: `Konu ile ilgili sorunuzu \`SORULAR\` kategorisi altındaki ${state_channel[Q.bilgisayar]} kanalına sorunuz. ` + priority_question,
    [Q.diger]     : `Konu ile ilgili sorunuzu \`SORULAR\` kategorisi altındaki ${state_channel[Q.diger]} kanalına sorunuz. `,

    [Q.acil]   : priority_response,
    [Q.sabirli]: priority_response,

    [Q.bitir]  : `Son olarak ${state_channel[Q.bitir]} kanalına`+" gözatmayı unutmayın. Keyifli bir vakit geçirmeniz dileğiyle.```Onay sistemi sonlandırıldı.```",
}

// a little assertion that would eliminate headache of unsynchronized d table and state_labels
//
const get_enum_keys = <T extends object>(enum_t : T) : (keyof T)[] => {
    return Object.keys(enum_t) as (keyof T)[];
}
for (const key of get_enum_keys(d)) {
    const expected = d[key].length;
    const actual   = state_choices[key].length;
    assert(expected == actual);
}
// empty scope
{
    const expected = get_enum_keys(d).length;
    const actual   = get_enum_keys(state_question).length;
    const actual2  = get_enum_keys(state_choices).length;
    const actual3  = get_enum_keys(state_channel).length;
    assert(expected == actual);
    assert(expected == actual2);
    assert(expected == actual3);
}

const is_in_range_otherwise_send_failure = async <T extends object>(value : number, enum_t : T, value_name : string, enum_name : string, interaction : CommandInteraction | ButtonInteraction) : Promise<boolean> => {
    const casted_enum = Object.keys(enum_t) as (keyof T)[];
    if (typeof casted_enum[value] === 'undefined') {
        await dcmodule.respond_interaction_failure_to_user_and_log(module_name, `${value_name}[${value}] is out of range in ${enum_name} enum range`, interaction);
        return false;
    }
    return true;
}

export async function execute(interaction : CommandInteraction | ButtonInteraction, state : command_user_state) : Promise<boolean> {
    
    if (false == await is_in_range_otherwise_send_failure(state.state, Q, "state.state", "Q", interaction)) return true;

    let chosen : number | undefined = undefined;
    let q = state.state as Q;
    const rollback_q = q;

    // increment user state if its a button reaction
    if (interaction instanceof ButtonInteraction) {

        // try parse customId
        const n = Number(interaction.customId);
        if (isNaN(n) || n.toString() != interaction.customId) {
            await dcmodule.respond_interaction_failure_to_user_and_log(module_name, `customId[${interaction.customId}] is not a number`, interaction);
            return true;
        }

        // check if button index is valid for the given state
        if (false == await is_in_range_otherwise_send_failure(n, d[q], "state.state", "Q", interaction)) return true;

        // transition to next state
        chosen = n;
        q = state.state = d[q][n];
    }

    // prepare user interface
    const question = state_question[q];
    const choices  = state_choices[q];

    let buttons = new MessageActionRow()
        .addComponents(
            choices.map((x, i) => new MessageButton().setCustomId(i+"").setLabel(x).setStyle(MessageButtonStyles.PRIMARY))
        );

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setDescription(question);


    state.state = rollback_q;
    if (q == Q.basla) {
        let response : any = { ephemeral: true, embeds: [embed], components: [buttons] };
        await interaction.reply(response);
    }
    else {
        interaction = interaction as ButtonInteraction;
        let response : any = { embeds: [embed], components: choices.length == 0 ? [] : [buttons]};
        await interaction.update(response);
    }
    state.state = q;

    (async (n) => {
        const dedikodu_channel = await interaction.guild?.channels.fetch(dcmodule.channel_id.yonetim_dedikodu);
        if (dedikodu_channel?.isText()) {
            const user = dcmodule.get_user_info(interaction.user)
            const msg = n !== undefined
                ? "```css\n"+`[${user.name}] id=${user.id} seçenek seçti = [${state_choices[rollback_q][n]}]`+"```"
                : "```css\n"+`[${user.name}] id=${user.id} #hosbuldum komutunu başlattı.`+"```"
                ;
            await dedikodu_channel.send(msg);
        }
    })(chosen);

    if (q == Q.bitir) {
        state.state = Q.basla;
        // give user role
        const guild_user = await interaction.guild?.members.fetch(interaction.user);
        if (!guild_user) {
            return true;
        }
        await guild_user.roles.add(dcmodule.role_id_tp_uyesi);
        return true;
    }
    return false;
}