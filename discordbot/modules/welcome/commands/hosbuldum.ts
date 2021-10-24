import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { dcmodule } from "../../../module";
import { assert } from "console";

export const data = new SlashCommandBuilder()
    .setName('hosbuldum')
    .setDescription('Türk programcılar onay sistemini başlatır')
    .setDefaultPermission(false);

export const permissions = [
    { id: dcmodule.role_id_hosgeldiniz, type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
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
const label_bitir = ["kurallari oku eyw"];
const label_topics = [
    "Yazılım ile ilgili",
    "Bilgisayar, donanım, teknik veya bir arıza ile ilgili",
    "Bu konuların dışında merak ettiğim bir konu (yazılıma başlangıç tavsiyesi, üniversite veya diğer...)",
];
const label_priority = [
    "Durumum acil",
    "Sabırlıyım teşekkürler.",
];
const state_labels : { [key in Q]: string[] } = {
    [Q.basla]: [
        "Yardıma ihtiyacım var",
        "Sohbet ",
        "Proje paylasmak",
        "Reklam veya partnerlik",
    ],
    
    [Q.yardim]: label_topics,
    [Q.sohbet]: label_bitir,
    [Q.proje] : label_bitir,
    [Q.reklam]: label_bitir,

    [Q.yazilim]   : label_priority,
    [Q.bilgisayar]: label_priority,
    [Q.diger]     : label_bitir,

    [Q.acil]   : label_bitir,
    [Q.sabirli]: label_bitir,

    [Q.bitir]  : [],
}

// a little assertion that would eliminate headache of unsynchronized d table and state_labels
//
const get_enum_keys = <T extends object>(enum_t : T) : (keyof T)[] => {
    return Object.keys(enum_t) as (keyof T)[];
}
for (const key of get_enum_keys(d)) {
    const expected = d[key].length;
    const actual   = state_labels[key].length;
    assert(expected == actual);
}


export async function execute(interaction : CommandInteraction) {
    
    const row = new MessageActionRow()
        .addComponents( new MessageButton()
            .setCustomId('primary')
            .setLabel('Primary')
            .setStyle('PRIMARY'),
        );

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Some title')
        .setURL('https://discord.js.org')
        .setDescription('Some description here');

    await interaction.reply({ content: 'Pong!', ephemeral: true, embeds: [embed], components: [row] });
}