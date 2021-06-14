require("./../constants.js");
const db     = require("./../mongodb.js");
const parser = require("./../cmdparser.js");
const tools  = require("../tools.js");

const fs        = require("fs").promises;
const fsC       = require("fs")
const Discord   = require('discord.js');
const { parse } = require("path");
const Jimp      = require("jimp");


const send_embed_item = async (msg, id) => {
    const [is, p] = await Promise.all([
        ensure(itemstb, db.get_items),
        tools.read_icon(id)
    ]);
    const i = is.find(x=>x["Num"]==id.toString());
    const title = (i?.strName??"Item not found").replace(/\(\+[0-9]+\)/, '').trim();
    const price = i?.BuyPrice??0;
    const num   = i?.Num;
    let embedded = new Discord.MessageEmbed()
        .setThumbnail(`attachment://icon.png`)
        .setFooter(`\`${num}\``)
        ;
        //.addField('`'+title+'`', (i?.strDesc) ? parser.tqs(i.strDesc) : "-");
        
    // cleanup values with 0 and already shown values
    if (i) {
        delete i["_id"];     delete i["Num"];
        delete i["strName"]; //delete i["strDesc"];
        //delete i["IconID"];  //delete i["BuyPrice"];
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
            .addField('`'+title+'`', parser.tqs(JSON.stringify(i??{},null,'\t'),'json'))
    });
};
const ensure = async (tb, cachef) => {
    if (!state.cache.table[tb]) state.cache.table[tb] = await cachef();
    return state.cache.table[tb];
}
// get random item id
const get_riid = async () => {
    const items = await ensure(itemstb, db.get_items);
    const rid = (i=>i[Math.floor(Math.random()*i.length)])(items.map(x=>x["Num"]));
    return rid;
}
const render_inventory = async (inventory, iconspath, bgfile) => {
    // l= length, oix= offset inventory x, ogx= offset gear x, iw= inventory width,
    // ih= inventory height, gw= gear width, gh= gear height
    const l=45, oix=0, oiy=1, ogx=7, ogy=0, iw=7, ih=4, gw=3, gh=5, LIMIT=iw*ih;
    const bg = await Jimp.read(iconspath+'/'+bgfile);
    const icons = await Promise.all(inventory.slice(0,LIMIT).map(async (id,i) => {
        let im = await Jimp.read(await tools.guard_iconpath(id));
        return { "i": i, "im": im };
    }));
    for (const {i, im} of icons) {
        const x=i%iw, y=(i/iw)|0;
        bg.composite(im, l*(oix+x), l*(oiy+y));
    }
    return await bg.getBufferAsync(Jimp.MIME_PNG);
}
let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
        case "message": const msg = args.msg;

        if (parser.cooldown_global(state, "bakkal_merak", 10)
            && msg.content.includes("merak")) {
            const rid = await get_riid();
            await send_embed_item(msg, rid);
        }

        if (!parser.is(msg, state.prefix))
            return;

        if (msg.channel.id == cid.botkomutlari) {
            if (parser.is(msg, "seviyeler")) {
                let out = (await ensure(levelstb, db.get_levels)).reduce((a,c)=>a+=`${c.lvl}:${c.exp}\n`,'');
                msg.channel.send(parser.tqs(out));
            }
            else if (parser.is(msg, "profil")) {
                const premium = parser.is(msg,'p');
                if (!parser.cooldown_user(state, msg.author.id, "bakkal_profil", 10)) {
                    parser.send_uwarn(msg, "komutu tekrar kullanabilmek icin lutfen bekleyin");
                    return;
                }
                parser.mention_else_self(msg, async id => {
                    const user = msg.guild.members.cache.get(id).user;
                    const iname = `inventory${(premium ? '_premium' : '')}.png`;
                    // we have 2 different tasks that can be executed in parallel
                    // use promise all to execute them in paralel and wait for them.
                    const [explvl, image] = await Promise.all([
                        (async () => {
                            let l = 1;
                            const uexp = (await db.get_exp(id)).exp;
                            for (const level of await ensure(levelstb, db.get_levels))
                                if (uexp < level.exp) break;
                                else l++;
                            return [uexp, l];
                        })(),
                        (async () => {
                            const inventory = await db.get_inventory(id);
                            return await render_inventory(inventory, iconpath, iname);
                        })()
                    ]);
                    const lvl=explvl[1], uexp=explvl[0];
                    await msg.channel.send({
                        files: [{
                            attachment: image,
                            name: iname
                        }],
                        embed: new Discord.MessageEmbed()
                            .setTitle("`"+user.username+"`")
                            .setDescription(parser.tqs(`Exp: ${uexp} Lvl: ${lvl}`))
                            .setThumbnail(user.avatarURL())
                            .setImage(`attachment://${iname}`)
                    });
                })
            }
            
            // beyond is admin
            if (!groups.admins.includes(msg.author.id))
                return;

            if (parser.is(msg, "item ")) {
                // id ile item bilgisi sorgulama
                parser.i_arg(msg, i => send_embed_item(msg, i));
    
    
                if (parser.is(msg, "test")) await Promise.all([
                    send_embed_item(msg, 38904700),
                    send_embed_item(msg, 11111000),
                ]);
            }
            else if (parser.is(msg, "torpil")) {
                const do_f = async iid => {
                    await db.give_item(msg.author.id, iid);
                };
                parser.i_arg(msg, do_f, async ()=> await do_f(await get_riid()));
            }
        }

        break;
    }
}