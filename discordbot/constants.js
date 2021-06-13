// env import
consts = {
    env: {
        phphost   : process.env.DCBOT_PHPHOST,
        noarena   : process.env.DCBOT_NOARENA,
        prefix    : process.env.DCBOT_PREFIX,
        debug     : process.env.DCBOT_DEBUG,
        dbconnstr : process.env.DCBOT_DBCONNSTR
    }
};

// emoji ids
eid_kekt = "823934807724785664";
eid_keky = "824702674712526879";

// user ids
uid={
    disboard: "302050872383242240",
    ockis2  : "824573651390562325",
};
// user groups
groups = {
    admins: [uid.ockis2],
};

// roles
rid = {
    botlar: "782738487921213461",
}

// channel ids
cid = {
    p2p         : "824685500686008350",
    wschannel   : "825713784848252938",
    arena       : consts.env.debug ? "852230553536167956" : "850465092537286656",
    ozelestiri  : "782947118062764033",
    hergunogren : "844643095923654667",
    ogreticisey : "836490628249550878",
    makale      : "811268737939669063",
    bumperado   : "782742548052574239",
    botkomutlari: consts.env.debug ? "852552268430966824" : "841987730551603200",
}


// category ids
caid = {
    yonetim       : "782717527587160085",
    bilgilendirme : "832603333654216704",
    sorusor       : "827889948941746178",
    takilmaca     : "825271028476542996",
    etkinlikler   : "821422645744369784",
    paylasimlar   : "832158366541283358",
    kodlama       : "792034825640738826",
    tpbot         : "823470264025088020",
    yayin         : "698972054740795455",
    muzikses      : "826154162638946355",
    loglar        : "850078444418498596",
}

// msg constants
msg_testmode = "Bakımdan dolayı sadece yetkililer komut çalıştırabilir.";
msg_status   = consts.env.debug ? ["_","¯"].map(x=>x+consts.env.debug+x) : [
    "Türk Programcılar discord sunucusuna hoşgeldin!",
    "Programlama öğrenmek için harika bir gün!",
    "Hemen programlamaya başla"
];

// exp system
exps={
    bump: 500,
    default: 1,
}
exps_by_channel={};
exps_by_channel[cid.ozelestri] = 1000;
exps_by_channel[cid.hergunogren] = 1000;
exps_by_channel[cid.ogreticisey] = 10;
exps_by_channel[cid.makale] = 15;

exps_by_category={};
exps_by_category[caid.sorusor] = 5
exps_by_category[caid.etkinlikler] = 3
exps_by_category[caid.paylasimlar] = 5
exps_by_category[caid.kodlama] = 5
exps_by_category[caid.tpbot] = 1
exps_by_category[caid.yayin] = 2
exps_by_category[caid.muzikses] = 1
exps_by_category[caid.loglar] = 0

// db consts

dbname  = "mongodb_tp"
userstb = "users"
itemstb = "items"
levelstb= "levels"
alltb   = [itemstb, levelstb, userstb]

module.exports = {};
