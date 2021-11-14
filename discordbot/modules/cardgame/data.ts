// type definitions

import { coin } from "./data.builder.coin";
import { flips } from "./data.builder.flips";

export enum limit {
    attack_category,
}
export interface damage {
    self?: number,
    target?: number,
    percentage?: boolean,
}
export enum from {
    self_random,
    self_select,
    enemy_random,
    enemy_select,
    deck_3,
}
export enum alive_until {
    flip_heads_at_round_end,
    flip_fails_at_round_end,
    round_ends,
}
export enum trigger {
    round_begin,
    round_end
}
export enum target {
    self, enemy, both
}
export enum buff_category {
    healing,
    harming,
    status,
}
export interface buff {
    type: buff_category,
    aim: target,
    // determined when the actions of this buff procs
    when?: trigger,
    life: alive_until,
    actions: action[],
}
export interface action {
    attack?: damage,
    heal?: damage,
    pick_card?: from,
    // transforms card into the chosen card. do not destroy other card. replace it with the same as chosen.
    transform_card?: from,
    discard_card?: from,
    // defines whether any of the card actio (pick, transform and discard) should be revealed when action is taken
    show_card?: boolean,

    /*** MODIFIERS ***/

    // emits the whole next damaging attack, if number > 1 it is said to have multiple times of this protection
    protection?: number,
    // mirrors the whole next damaging attack, if number > 1 it is said to have multiple times of this
    mirror_attack?: number,
    // cleanse debuffs on player
    cleanse?: boolean,
    // purges buffs on target
    purge?: boolean,
    // clones all enemy buffs to the player self
    clone_enemy_buffs?: boolean,
    // reveals all enemy cards to public view
    reveal_enemy_cards?: boolean,
    // redraws all the cards
    redraw_all_cards?: boolean,
    // paralyze
    paralyze?: boolean,
}
export interface coin_action {
    heads?: action,
    tails?: action,
}

export enum rarity {
    "Yaygın" = 1,
    "Güzide",
    "Esrarengiz",
    "İhtişamlı",
    "Destansı",
}
export interface card {
    // applies a certain limit on card play, i.e if thats an attack card
    // player can only play one attack card per round
    play_limit?: limit,
    // instantaneous actions soon as card is played
    actions?: action[],
    flips?: coin_action[],
    // if true flips[] will be not fully iterated when a coin is tail
    tail_break?: boolean,
    buffs?: buff[],

    // UI and text features
    title: string, link: string, description: string, rarity: rarity
}
type part<Type> = {
    [Property in keyof Type as Exclude<Property, "play_limit" | "rarity" | "title" | "description" | "link">]: Type[Property]
};
export type partial_card = part<card>;

// Card Database
// -----------------------------------------------------------------------------


export enum card_no {
    efsanevi_ataturk = 1,
    // 2=
    hasan_mezarci, muzlu_ajdar, koca_isteyen_kari, 
    // 5=
    korkusuz_korkak, kara_murat_benim, yossi_kohen, usta_rakun, zikir_halkasi,
    // 10=
    erotik_ajdar, yengec_risitas, gozleri_kayan_acun, halay, tivorlu_ismail,
    // 15=
    changerboyle, tatar_ramazan, tp_moderatorlerin_gazabi, inshallah, le_umut_peace,
    // 20=
    kralin_soytari_gifi, kufurbaz_kral, tempolu_gunaydin, iboy, hainboyle,
    // 25=
    ins_cnm_ya
}
export const cards: { [key in card_no]: card } = {
    [card_no.efsanevi_ataturk]: {
        rarity: rarity.Destansı,
        title: "Efsanevi Atatürk",
        link: "https://media1.tenor.com/images/2f94086d9d8d7616090e8dabb8e17ff7/tenor.gif?itemid=15462494",
        description: "Oyuncuyu tum zararli buyulerden kurtarir, gucunu tamamen yeniler ve dusmanin tum yararli buyulerini bozar.",
        actions: [
            { cleanse: true },
            { purge: true },
            { heal: { self: 1.0, percentage: true } }
        ]
    },
    [card_no.hasan_mezarci]: {
        rarity: rarity.Esrarengiz,
        title: "Sakasina gulunmeyen adam",
        link: "https://media1.tenor.com/images/726bfd542c9483c0831bbef0b658d978/tenor.gif",
        description: "Hoca komik bir laz fikrasi anlatir ve dusman bir tur boyunca afallar",
        buffs: [
            {
                type: buff_category.harming,
                aim: target.enemy,
                when: trigger.round_begin,
                life: alive_until.round_ends,
                actions: [
                    { paralyze: true }
                ]
            }
        ]
    },
    [card_no.muzlu_ajdar]: {
        rarity: rarity.Güzide,
        title: "Muzlu Ajdar",
        link: "https://media1.tenor.com/images/ef02df106010033ce4edc91c3a602308/tenor.gif?itemid=15700432",
        description: "Popstar Ajdar teknesinden dusmanina dogru bir bakis attiktan sonra muzundan bir isirik alir. Dusman kendini Turkiye'nin stari karsisinda gucsuz hisseder.",
    },
    [card_no.koca_isteyen_kari]: {
        rarity: rarity.Güzide,
        title: "Koca isteyen kari",
        link: "https://media1.tenor.com/images/34121fc8c9f07be8fc19a13f300df98f/tenor.gif?itemid=11898048",
        description: "Koca isteyen kari polislerin elinde rehin durumdadir ve Oyuncu yazi tura atar. Yazi gelmesi halinde Koca isteyen kari polislerin elinden bir hazimle kurtularak oyuncuyu zararli buyulerden defeder. Bu durumda Oyuncu bir daha yazi tura atar. Eger tekrar yazi gelirse Koca isteyen kari dusmanina aldigi depar sonucu kafa atar ve ona X hasar verir",
        flips: [
            { heads: { cleanse: true } },
            { heads: { attack: { target: 20 } } },
        ],
        tail_break: true,
    },
    [card_no.korkusuz_korkak]: {
        rarity: rarity.İhtişamlı,
        title: "Korkusuz korkak",
        link: "https://media1.tenor.com/images/b93b5c2d5566ff7420f53679cfa49ac3/tenor.gif?itemid=12492940",
        description: "Korkusuz Korkak dusmanini tokat yagmuruna tutar. Oyuncu en fazla bes kere ard arda yazi tura atar. Her gelen yazi icin dusmani 20 saglik kaybeder. Ilk gelen tura ardindan yazi tura atma kesilir.",
        play_limit: limit.attack_category,
        ...flips.sequential(5, coin.attack(20))
    },
    [card_no.kara_murat_benim]: {
        rarity: rarity.Esrarengiz,
        title: "Kara Murat benim",
        link: "https://media.tenor.com/images/fad02d9f6cf14dd6dd116f3739d55b4b/tenor.gif",
        description: "Kara Murat 2 tane klon kardeşini oluşturup kara murat benim diye haykırır ve sesi aynı anda echo yapar. Kara murat kardeşleriyle sağ gösterip sol vurur.",
        play_limit: limit.attack_category,
        actions: [
            { attack: { target: 10 } },
        ],
        flips: [
            { heads: { attack: { target: 10 } } },
            { heads: { attack: { target: 10 } } },
        ],
    },
    [card_no.yossi_kohen]: {
        rarity: rarity.İhtişamlı,
        title: "Yossi Kohen",
        link: "https://cdn.discordapp.com/attachments/842470001155899430/842499112858419200/1395444_306438912828769_165980884_n.png",
        description: "Yahudi is adami Yossi Kohen cok fazla guler ve bunun sonucunda dusman yapmis oldugu saldirinin aynisini kendi hanesine uygular. Ayni zamanda Yossi Kohen firsat buldukca duzenli tras oldugu icin dusmanin uzerinde bulunan iyilestirmelerden Oyuncu ayni sekilde faydalanir",
        actions: [
            { mirror_attack: 1 },
            { clone_enemy_buffs: true },
        ]
    },
    [card_no.usta_rakun]: {
        rarity: rarity.Yaygın,
        title: "Usta Rakun",
        link: "https://media.tenor.com/images/904da7243ad3d7dfd5c553b48b374d0b/tenor.gif",
        description: "Elindeki bir karti sec ve karsi rakibe goster. Sonra bu karti yoket ve destenden yeni bir kart sec. Yeni sectigin karti da rakibe goster.",
        actions: [
            { discard_card: from.self_select, show_card: true },
            { pick_card: from.deck_3, show_card: true },
        ]
    },
    [card_no.zikir_halkasi]: {
        rarity: rarity.Esrarengiz,
        title: "Zikir halkasi",
        link: "https://media1.tenor.com/images/a5841e7db62735c0c85b6c6ddf670afe/tenor.gif?itemid=18466605",
        description: "Oyuncu elindeki tum kartlari desteye geri koyar, kartlari karistitir ve tekrar ayni miktarda kart geri ceker.",
        actions: [
            { redraw_all_cards: true },
        ]
    },
    [card_no.erotik_ajdar]: {
        rarity: rarity.İhtişamlı,
        title: "Erotik Ajdar",
        link: "https://media1.tenor.com/images/dc1947baee381b7b23a02d6a6b4596d3/tenor.gif?itemid=15700431",
        description: "Popstar Ajdar bir esinti edasi ile dans etmeye baslar. Erotik figurleri karsisinda gozleri kamasmis olan dusmanin elinden tum kartlari masaya acilir ve gizli emelleri apacik ortaya tezahur eder.",
        actions: [
            { reveal_enemy_cards: true },
        ]
    },
    [card_no.yengec_risitas]: {
        rarity: rarity.İhtişamlı,
        title: "Yengec Risitas",
        link: "https://media1.tenor.com/images/0ac10f80d848a929d272edcff0acb9a4/tenor.gif?itemid=19258334",
        description: "Oyuncunun yaninda destek olmak icin Yengec Risitas ringe cikar ve saldirgan bir sekilde yengec dansi yapmaya baslar. Rakip kendi sirasi bitiminde yazi tura atar. Yazi gelirse Risitas knock-out olur ancak tura gelirse Risitas kiskaclariyla rakibe 20 hasar verir ve hayatta kalmaya devam eder.",
        buffs: [
            {
                type: buff_category.harming,
                aim: target.enemy,
                when: trigger.round_end,
                life: alive_until.flip_heads_at_round_end,
                actions: [
                    { attack: { self: 20 } }
                ]
            },
        ]
    },
    [card_no.gozleri_kayan_acun]: {
        rarity: rarity.İhtişamlı,
        title: "Gozleri kayan Acun",
        link: "https://media.tenor.com/images/02c2e5da032abca1e18228c759c7a895/tenor.gif",
        description: "Oyuncu medya sahibi Acun'u sahaya davet eder ve rakip bir sonraki tur yapacagi darbe Acun'a isabet eder. Acunun gozleri kayar. Oyuncu hasar almaz.",
        actions: [
            { protection: 1 },
        ],
    },
    [card_no.halay]: {
        rarity: rarity.Güzide,
        title: "Halay",
        link: "https://media.tenor.com/images/9f3d15280ecb7c20d4c6d3d35a52ce26/tenor.gif",
        description: "Oyuncu halaya dahil olur ve oynamaya baslar. Halay sirasinda halay basi yazi tura atar. Eger yazi gelirse Oyuncu destesinden istedigi bir karti alir.",
        flips: [
            { heads: { pick_card: from.self_select } }
        ],
    },
    [card_no.tivorlu_ismail]: {
        rarity: rarity.Esrarengiz,
        title: "Tivorlu Ismail",
        link: "https://media.discordapp.net/attachments/829256056156586044/840294047314739210/tumblr_m38mn15UyX1qfltf6o1_r2_2501.gif",
        description: "Tivorlu Ismail Hela Vela Velvela adli eserini canlandirmaya baslar. Hay Masallah dedikten sonra Zih der ve Aaaa diye yukselmeye baslar. Rakip 20 hasar alir. Tivorlu Ismail Aaaaa nakaratini tekrarladikca oyuncu yazi tura atar. Her yazi ardina tekrar yazi tura atar ve rakibine 10 hasar verir. Oyuncu yazi turayi 3 kere kombolama hakkinda sahiptir. Eger oyuncu 3 kere yazi tutturursa Ismail Hay masallah fakirim diyip parcasini bitirir ve Oyuncu kendine 20 hasar verir.",
        play_limit: limit.attack_category,
        actions: [
            { attack: { target: 20 } },
        ],
        flips: [
            { heads: { attack: { target: 10 } } },
            { heads: { attack: { target: 10 } } },
            { heads: { attack: { target: 10, self: 20 } } }
        ],
        tail_break: true,
    },
    [card_no.changerboyle]: {
        rarity: rarity.Destansı,
        title: "ChangerBoyle",
        link: "https://cdn.discordapp.com/attachments/842470001155899430/847973979326382090/unknown.png",
        description: "Karsi rakibin herhangi bir kartini taklit edebilir.",
        actions: [
            { transform_card: from.enemy_select }
        ],
    },
    [card_no.tatar_ramazan]: {
        rarity: rarity.Esrarengiz,
        title: "Tatar Ramazan",
        link: "https://cdn.discordapp.com/attachments/842470001155899430/855528889660997692/insanlarin-uzerine-sag-tiklayip-ozellik-gormek_205223.png",
        description: "Yazi tura at. Yazi gelirse dusmana 40 hasar yapistir.",
        play_limit: limit.attack_category,
        flips: [{ heads: { attack: { target: 40 } } }]
    },
    // 17=
    [card_no.tp_moderatorlerin_gazabi]: {
        rarity: rarity.Destansı,
        title: "TP Moderatörlerin gazabı",
        link: "https://media3.giphy.com/media/XaLLCvwgRxpwlnnzkh/giphy.gif?cid=790b7611438c6d6c0cfddbdb168cc8b86b99d49cac4b7a29&rid=giphy.gif&ct=g",
        description: "TP Discord sunucusunu moderatörleri bir araya gelerek üyeler üzerinde yetkilerini kullanma suretiyle sunucuda terör estirmeye başlarlar. Korku içerisinde kalan rakip ne yapamayacağını bilemez ve 2 tur boyunca oyundan banlanır, kart çekemez.",
    },
    [card_no.inshallah]: {
        rarity: rarity.Güzide,
        title: "Inshallah",
        link: "https://c.tenor.com/wnuXIUDfJLsAAAAC/ron-swanson-nick-offerman.gif",
        description: "Türk programcı yazılım geliştirme yaparken takıldığı noktaları ve sorunları TP Discord sunucusunda paylaşır. Sunucu bireyleri oyuncuya destek olarak sorununu çözer, yardımcı olur ve inşallah gifi atarlar. Bunun sonunda motive olmuş üye kod yazmaya devam eder ve iki tur boyunca 20 iyileştirme alır.",
    },
    [card_no.le_umut_peace]: {
        rarity: rarity.Esrarengiz,
        title: "Le Umut Peace",
        link: "https://c.tenor.com/xjz_SE0yqXQAAAAC/peace-disappear.gif",
        description: "Sunucuda Umut sohbetin tam ortasında durduk yere peace gifi atar ve ortadan kaybolur. Bunun sonucunda sunucu üyeleri afallar ve rakip 1 el boyunca hedefini ortada bulamaz.",
    },
    // 20=
    [card_no.kralin_soytari_gifi]: {
        rarity: rarity.İhtişamlı,
        title: "Kralın Soytarı gifi",
        link: "https://c.tenor.com/a5d4lrIx9rIAAAAd/jimin-bye-jimin-bts.gif",
        description: "TP Kralı sunucuda Umutun peace gifi üzerine Soytarı Peace gifi atar. Oyuncu ortadan kaybolur ve rakip 1 el boyunca hedefini ortada bulamaz. Eğer herhangi bir oyuncu önceden Le Umut Peace kartı atmışsa bunun üzerine oynanan bu kart kombo etkisi yaratır ve ansızın modsuz kalan sunucuda kaos ortamı oluşur. İki oyuncu rastgele birer kart kaybeder ve 20 hasar puanı alırlar.",
    },
    [card_no.kufurbaz_kral]: {
        rarity: rarity.Destansı,
        title: "Küfürbaz Kral",
        link: "https://media.giphy.com/media/PL4yLaVxeYreemo2kY/giphy.gif",
        description: "TP Kralı sunucudan uzun bir süre uzakta kalır ve geri geldiğinde notification fırtınasına uğrar. Bunun sonucunda sinirlenir ve notification sayısı kadar düşmana hasar verir. Bu saldırı koruyucu büyüler tarafından engellenemez.",
    },
    [card_no.tempolu_gunaydin]: {
        rarity: rarity.Esrarengiz,
        title: "Tempolu Günaydın",
        link: "https://c.tenor.com/_1z9JvYh7dwAAAAC/goose-silly.gif",
        description: "Oyuncu güne iyi başlar ve her round başı yazı tura atar. Yazı gelmesi durumunda tur başı çektiği kartın üzerine fazla bir kart çeker. Bu büyü uç tur sürer.",
    },
    [card_no.iboy]: {
        rarity: rarity.Güzide,
        title: ":IBOY:",
        link: "https://cdn.discordapp.com/attachments/842470001155899430/902335657274376192/unknown.png",
        description: "Oyuncu TP sunucusunda en çok kullanılan emojiyi atar 1 kart çeker ve rakip 10 hasar alır. Oyuncu :IBOY: kartını ard ardına spamlaması durumunda her bir oynayış başı kartın hasarı 10 artar. Kart en fazla 30 hasara ulaşabilir.",
    },
    [card_no.hainboyle]: {
        rarity: rarity.Destansı,
        title: "HainBöyle",
        link: "https://c.tenor.com/Rbfv2Nbq_u4AAAAC/swinging-chilling.gif",
        description: "RabirtBoyle TP Discord sunucunun sahibi olmak için hain planlar yapar ve bu emeller içinde oyuncuya aynı tur içerisinde ikinci bir saldırı kartı oynama ayrıcalığı verir.",
    },
    // 25=
    [card_no.ins_cnm_ya]: {
        rarity: rarity.Güzide,
        title: "İnş cnm ya :)",
        link: "https://media4.giphy.com/media/ob44JUxIej8jJEeEgp/giphy.gif?cid=790b7611a4c4375931ff92ee0e899e0c390702526109de29&rid=giphy.gif&ct=g",
        description: "Belirsizliğin ortasında kalınıldığında sunucuda inş cnm ya gifi atılır. Ne olacağı belli olmayan bu durumda sorun yaşayan oyuncu ya 30 sağlık puanı kaybeder yada rakibine 30 hasar verir.",
    },
}