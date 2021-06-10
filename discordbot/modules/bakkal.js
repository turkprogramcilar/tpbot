require("./../constants.js");
const db    = require("./../mongodb.js");
const parse = require("./../cmdparser.js");
const fs    = require("fs").promises;

const Discord = require('discord.js');

const iconpath = './discordbot/icons';

const send_embed_item = async (msg, id) => {
    const [i, p] = await Promise.all([
        db.get_item(id),
        fs.readFile(`${iconpath}/${id}.png`)
            .catch(async ()=> fs.readFile(`${iconpath}/undefined.png`))
            //.catch() buda yoksa coksun bot napalim.
    ]);
    
    const title = (i?.strName??"Item not found");
    const price = i?.BuyPrice??0;
    let embedded = new Discord.MessageEmbed()
        .setThumbnail(`attachment://icon.png`)
        .addField('`'+title+'`', (i?.strDesc) ? parse.tqs(i.strDesc) : "-");
        
    // cleanup values with 0 and already shown values
    if (i) {
        delete i["_id"];     delete i["id"];
        delete i["strName"]; delete i["strDesc"];
        delete i["IconID"];  delete i["BuyPrice"];
        for (const k of Object.keys(i)) {
            if (!i[k] || i[k].toString()=='0')
                delete i[k];
        }
    }
    
    await msg.channel.send({
        files: [{
            attachment: p,
            name:'icon.png'
        }],
        embed: embedded
            .addField(`Buy price: ${price}`, parse.tqs(JSON.stringify(i??{},null,'\t'),'json'))
    });
};

let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
        case "message": const msg = args.msg;

        if (!parse.is(msg, state.prefix))
            return;

        if (msg.channel.id == cid.botkomutlari) {
            if (parse.is(msg, "bk ")) {
                // id ile item bilgisi sorgulama
                parse.i_arg(msg, i => send_embed_item(msg, i));
    
                // beyond is admin
                if (!groups.admins.includes(msg.author.id))
                    return;
    
                if (parse.is(msg, "test")) await Promise.all([
                    send_embed_item(msg, 38904700),
                    send_embed_item(msg, 111110000),
                    send_embed_item(msg, 389047000),
                ]);
            }
            else if (parse.is(msg, "seviyeler")) {
                if (!state.cache.table.level) state.cache.table.level = await db.get_levels();
                let out = state.cache.table.level.reduce((a,c)=>a+=`${c.lvl}:${c.exp}\n`,'');
                msg.channel.send(parse.tqs(out));
            }
            else if (parse.is(msg, "profil ")) {
                parse.mention(msg, async id => {
                    if (!state.cache.table.level)
                        state.cache.table.level = await db.get_levels();
                    const user = msg.mentions.users.first();
                    const uexp = (await db.get_exp(id)).exp;
                    let lvl = 1;
                    for (const level of state.cache.table.level)
                        if (uexp < level.exp) break;
                        else lvl ++;
                    msg.channel.send(new Discord.MessageEmbed()
                        .setTitle("`"+user.username+"`")
                        .setDescription(parse.tqs(`Exp: ${uexp} Lvl: ${lvl}`))
                        .setThumbnail(user.avatarURL())
                    );
                })
            }
        }

        break;
    }
}