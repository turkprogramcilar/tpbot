// emoji ids
eid_kekt = 823934807724785664;
eid_keky = 824702674712526879;

// user ids
uid_ockis = 824573651390562325;
uid_tpbot = 802911540273348638;

// user groups
uid_admins = [
    uid_ockis,
];

// channel ids
cid_p2p = 824685500686008350;
cid_gameserver = 825713784848252938;
cid_arena = "850465092537286656"
// category ids
caid_muzik = 826154162638946355
caid_kodlama = 792034825640738826
caid_etkinlik = 821422645744369784
caid_diller = 782713598245077013
caid_soru = 810183265029586974
caid_az_diller = 827074947272146974
caid_tp_bot = 823470264025088020

caid_fix = [
    caid_muzik,
    caid_kodlama,
    caid_etkinlik,
    caid_diller,
    caid_soru,
    caid_az_diller,
    caid_tp_bot,
];

// msg constants
msg_testmode = "Bakımdan dolayı sadece yetkililer komut çalıştırabilir.";
msg_status   = process.env.DCBOT_DEBUGGING ? ["_","¯"].map(x=>x+process.env.DCBOT_DEBUGGING+x) : [
    "Türk Programcılar discord sunucusuna hoşgeldin!",
    "Programlama öğrenmek için harika bir gün!",
    "Hemen programlamaya başla"
];

module.exports = {};
