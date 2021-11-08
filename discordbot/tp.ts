// tslint:disable-next-line: no-var-requires
const constants = require("../../discordbot/constants");
// turk programcilar discord sunucusu ile ilgili tanimlamalar
export abstract class tp
{

    // some constants
    static readonly guild_id_tp     : string = constants.sid.tpdc;
    static readonly role_id_kurucu  : string = constants.rid.kurucu;
    static readonly role_id_koruyucu: string = "782712917900525628";
    static readonly role_id_kidemli : string = constants.rid.kidemli;
    static readonly role_id_tp_uyesi: string = constants.rid.tp_uyesi;
    static readonly role_id_gozalti : string = constants.rid.gozalti;
    //
    static readonly user_id = {
        deadcode: "824573651390562325",
        logbot: "841479314519752784",
        chunk: "272044185689915392",
    }
    //
    static readonly emoji_id = {
        ricardo: "906998514238771231",
        nvidia: "906998783370465352",
    }
    static readonly gifs = {
        keke: "https://media1.giphy.com/media/KSrNm2ThozpYnh3abh/giphy.gif",
        hosgeldin: "https://media4.giphy.com/media/mTTuI8qkiXMtVjjqmq/giphy.gif",
        // hosbuldum komutu nasil kullanilir gifli anlatim:
        hosbuldum_komutu: "https://cdn.discordapp.com/attachments/900650376762626078/905845292061048832/hosbuldum_komutu.gif",
        nvidia: "https://tenor.com/view/linus-linus-torvalds-nvidia-fuck-you-gif-18053606",
    }
    //
    static readonly channel_id = {
        onay: "900650376762626078",
        bir_bak_buraya: constants.cid.bir_bak_buraya,
        roller: constants.cid.roller,
        // soru sor
        yazilim_sor: constants.cid.yazilim_sor,
        kafamda_deli_sorular: constants.cid.kafamda_deli_sorular,
        kodlama_disi_sor: constants.cid.kodlama_disi_sor,
        // main
        sohbet: constants.cid.sohbet,
        istek_oneri_sikayet: constants.cid.istek_oneri_sikayet,
        // tp oyunlari
        sicardo_nvidia: "782713536924221469",
        // paylasimlar
        proje_paylas: constants.cid.proje_paylas,
        // yonetim
        yetkili_komutlari: "851031980250103888",
        yonetim_dedikodu: constants.cid.yonetim_dedikodu,
        // gozalti
        gozalti: "836521603319595008",
        // tpbot
        tpbot_test_odasi: constants.cid.tpbot_test_odasi,
        tpbot_p2p: "824685500686008350",
    }
}