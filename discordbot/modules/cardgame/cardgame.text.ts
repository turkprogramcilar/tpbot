import { card_no } from "./cardgame.data";

export enum rarity {
    "Yaygın" = 1,
    "Güzide",
    "Esrarengiz",
    "İhtişamlı",
    "Destansı",
}
export interface card_text {
    rarity : rarity,
    title  : string,
    link   : string,
    description : string
}
const texts : { [key in card_no]: card_text } =
{
    [card_no.efsanevi_ataturk]: { 
        rarity: rarity.Destansı,
        title: "Efsanevi Atatürk", 
        link: "https://media1.tenor.com/images/2f94086d9d8d7616090e8dabb8e17ff7/tenor.gif?itemid=15462494",
        description: "Oyuncuyu tum zararli buyulerden kurtarir, gucunu tamamen yeniler ve dusmanin tum yararli buyulerini bozar."
    },
    [card_no.hasan_mezarci]: {
        rarity: rarity.Esrarengiz,
        title: "Sakasina gulunmeyen adam",
        link: "https://media1.tenor.com/images/726bfd542c9483c0831bbef0b658d978/tenor.gif",
        description: "Hoca komik bir laz fikrasi anlatir ve dusman bir tur boyunca afallar"
    },
    [card_no.muzlu_ajdar]: {
        rarity: rarity.Güzide, 
        title: "Muzlu Ajdar",
        link: "https://media1.tenor.com/images/ef02df106010033ce4edc91c3a602308/tenor.gif?itemid=15700432",
        description: "Popstar Ajdar teknesinden dusmanina dogru bir bakis attiktan sonra muzundan bir isirik alir. Dusman kendini Turkiye'nin stari karsisinda gucsuz hisseder."
    },
    [card_no.koca_isteyen_kari]: {
        rarity: rarity.Güzide, 
        title: "Koca isteyen kari",
        link: "https://media1.tenor.com/images/34121fc8c9f07be8fc19a13f300df98f/tenor.gif?itemid=11898048",
        description: "Koca isteyen kari polislerin elinde rehin durumdadir ve Oyuncu yazi tura atar. Yazi gelmesi halinde Koca isteyen kari polislerin elinden bir hazimle kurtularak oyuncuyu zararli buyulerden defeder. Bu durumda Oyuncu bir daha yazi tura atar. Eger tekrar yazi gelirse Koca isteyen kari dusmanina aldigi depar sonucu kafa atar ve ona X hasar verir"
    },
    [card_no.korkusuz_korkak]: {
        rarity: rarity.İhtişamlı, 
        title: "Korkusuz korkak", 
        link: "https://media1.tenor.com/images/b93b5c2d5566ff7420f53679cfa49ac3/tenor.gif?itemid=12492940",
        description: "Korkusuz Korkak dusmanini tokat yagmuruna tutar. Oyuncu en fazla bes kere ard arda yazi tura atar. Her gelen yazi icin dusmani 20 saglik kaybeder. Ilk gelen tura ardindan yazi tura atma kesilir."
    },
    [card_no.kara_murat_benim]: {
        rarity: rarity.Esrarengiz, 
        title: "Kara Murat benim", 
        link: "https://media.tenor.com/images/fad02d9f6cf14dd6dd116f3739d55b4b/tenor.gif",
        description: "Kara Murat 2 tane klon kardeşini oluşturup kara murat benim diye haykırır ve sesi aynı anda echo yapar. Kara murat kardeşleriyle sağ gösterip sol vurur."
    },
    [card_no.yossi_kohen]: {
        rarity: rarity.İhtişamlı, 
        title: "Yossi Kohen", 
        link: "https://cdn.discordapp.com/attachments/842470001155899430/842499112858419200/1395444_306438912828769_165980884_n.png",
        description: "Yahudi is adami Yossi Kohen cok fazla guler ve bunun sonucunda dusman yapmis oldugu saldirinin aynisini kendi hanesine uygular. Ayni zamanda Yossi Kohen firsat buldukca duzenli tras oldugu icin dusmanin uzerinde bulunan iyilestirmelerden Oyuncu ayni sekilde faydalanir"
    },
    [card_no.usta_rakun]: {
        rarity: rarity.Yaygın, 
        title: "Usta Rakun", 
        link: "https://media.tenor.com/images/904da7243ad3d7dfd5c553b48b374d0b/tenor.gif",
        description: "Elindeki bir karti sec ve karsi rakibe goster. Sonra bu karti yoket ve destenden yeni bir kart sec. Yeni sectigin karti da rakibe goster."
    },
    [card_no.zikir_halkasi]: {
        rarity: rarity.Esrarengiz, 
        title: "Zikir halkasi", 
        link: "https://media1.tenor.com/images/a5841e7db62735c0c85b6c6ddf670afe/tenor.gif?itemid=18466605",
        description: "Oyuncu elindeki tum kartlari desteye geri koyar, kartlari karistitir ve tekrar ayni miktarda kart geri ceker."
    },
    [card_no.erotik_ajdar]: {
        rarity: rarity.İhtişamlı, 
        title: "Erotik Ajdar", 
        link: "https://media1.tenor.com/images/dc1947baee381b7b23a02d6a6b4596d3/tenor.gif?itemid=15700431",
        description: "Popstar Ajdar bir esinti edasi ile dans etmeye baslar. Erotik figurleri karsisinda gozleri kamasmis olan dusmanin elinden tum kartlari masaya acilir ve gizli emelleri apacik ortaya tezahur eder."
    },
    [card_no.yengec_risitas]: {
        rarity: rarity.İhtişamlı, 
        title: "Yengec Risitas", 
        link: "https://media1.tenor.com/images/0ac10f80d848a929d272edcff0acb9a4/tenor.gif?itemid=19258334",
        description: "Oyuncunun yaninda destek olmak icin Yengec Risitas ringe cikar ve saldirgan bir sekilde yengec dansi yapmaya baslar. Rakip kendi sirasi bitiminde yazi tura atar. Yazi gelirse Risitas knock-out olur ancak tura gelirse Risitas kiskaclariyla rakibe 20 hasar verir ve hayatta kalmaya devam eder."
    },
    [card_no.gozleri_kayan_acun]: { 
        rarity: rarity.İhtişamlı, 
        title: "Gozleri kayan Acun", 
        link: "https://media.tenor.com/images/02c2e5da032abca1e18228c759c7a895/tenor.gif",
        description: "Oyuncu medya sahibi Acun'u sahaya davet eder ve rakip bir sonraki tur yapacagi darbe Acun'a isabet eder. Acunun gozleri kayar. Oyuncu hasar almaz."
    },
    [card_no.halay]: {
        rarity: rarity.Güzide, 
        title: "Halay", 
        link: "https://media.tenor.com/images/9f3d15280ecb7c20d4c6d3d35a52ce26/tenor.gif",
        description: "Oyuncu halaya dahil olur ve oynamaya baslar. Halay sirasinda halay basi yazi tura atar. Eger yazi gelirse Oyuncu destesinden istedigi bir karti alir."
    },
    [card_no.tivorlu_ismail]: {
        rarity: rarity.Esrarengiz, 
        title: "Tivorlu Ismail", 
        link: "https://media.discordapp.net/attachments/829256056156586044/840294047314739210/tumblr_m38mn15UyX1qfltf6o1_r2_2501.gif",
        description: "Tivorlu Ismail Hela Vela Velvela adli eserini canlandirmaya baslar. Hay Masallah dedikten sonra Zih der ve Aaaa diye yukselmeye baslar. Rakip 20 hasar alir. Tivorlu Ismail Aaaaa nakaratini tekrarladikca oyuncu yazi tura atar. Her yazi ardina tekrar yazi tura atar ve rakibine 10 hasar verir. Oyuncu yazi turayi 3 kere kombolama hakkinda sahiptir. Eger oyuncu 3 kere yazi tutturursa Ismail Hay masallah fakirim diyip parcasini bitirir ve Oyuncu kendine 20 hasar verir."
    },
    [card_no.changerboyle]: { 
        rarity: rarity.Destansı, 
        title: "ChangerBoyle", 
        link: "https://cdn.discordapp.com/attachments/842470001155899430/847973979326382090/unknown.png",
        description: "Karsi rakibin herhangi bi kartini taklit edebilir."
    },
    [card_no.tatar_ramazan]: {
        rarity: rarity.Esrarengiz, 
        title: "Tatar Ramazan", 
        link: "https://cdn.discordapp.com/attachments/842470001155899430/855528889660997692/insanlarin-uzerine-sag-tiklayip-ozellik-gormek_205223.png",
        description: "Yazi tura at. Yazi gelirse dusmana 40 hasar yapistir."
    }
}