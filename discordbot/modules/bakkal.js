require("./../constants.js");
const db    = require("./../mongodb.js");
const parser = require("./../cmdparser.js");
const fs    = require("fs").promises;

const Discord = require('discord.js');

const iconpath = './discordbot/icons';

const send_embed_item = async (msg, id) => {
    const [is, p] = await Promise.all([
        ensure(itemstb, db.get_items),
        fs.readFile(`${iconpath}/${id}.png`)
            .catch(async ()=> fs.readFile(`${iconpath}/undefined.png`))
            //.catch() buda yoksa coksun bot napalim.
    ]);
    const i = is.find(x=>x["Num"]==id.toString());
    const title = (i?.strName??"Item not found").replace(/\(\+[0-9]+\)/, '').trim();
    const price = i?.BuyPrice??0;
    let embedded = new Discord.MessageEmbed()
        .setThumbnail(`attachment://icon.png`)
        .addField('`'+title+'`', (i?.strDesc) ? parser.tqs(i.strDesc) : "-");
        
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
            .addField(`Buy price: ${price}`, parser.tqs(JSON.stringify(i??{},null,'\t'),'json'))
    });
};
const ensure = async (tb, f) => {

    if (!state.cache.table[tb]) state.cache.table[tb] = await f();
    return state.cache.table[tb];
}
let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
        case "message": const msg = args.msg;

        if (msg.content.includes("merak")) {
            const items = await ensure(itemstb, db.get_items);
            const rid = (i=>i[Math.floor(Math.random()*i.length)])(items.map(x=>x["Num"]));
            await send_embed_item(msg, rid);
        }

        if (!parser.is(msg, state.prefix))
            return;

        if (msg.channel.id == cid.botkomutlari) {
            if (parser.is(msg, "bk ")) {
                // id ile item bilgisi sorgulama
                parser.i_arg(msg, i => send_embed_item(msg, i));
    
                // beyond is admin
                if (!groups.admins.includes(msg.author.id))
                    return;
    
                if (parser.is(msg, "test")) await Promise.all([
                    send_embed_item(msg, 38904700),
                    send_embed_item(msg, 11111000),
                ]);
            }
            else if (parser.is(msg, "seviyeler")) {
                let out = await ensure(levelstb, db.get_levels).reduce((a,c)=>a+=`${c.lvl}:${c.exp}\n`,'');
                msg.channel.send(parser.tqs(out));
            }
            else if (parser.is(msg, "profil ")) {
                parser.mention(msg, async id => {
                    const user = msg.mentions.users.first();
                    const uexp = (await db.get_exp(id)).exp;
                    let lvl = 1;
                    for (const level of await ensure(levelstb, db.get_levels))
                        if (uexp < level.exp) break;
                        else lvl ++;
                    msg.channel.send(new Discord.MessageEmbed()
                        .setTitle("`"+user.username+"`")
                        .setDescription(parser.tqs(`Exp: ${uexp} Lvl: ${lvl}`))
                        .setThumbnail(user.avatarURL())
                    );
                })
            }
        }

        break;
    }
}