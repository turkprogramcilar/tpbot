require("./../constants.js");
const db     = require("./../mongodb.js");
const parser = require("./../cmdparser.js");
const tools  = require("../tools.js");

const fs        = require("fs").promises;
const fsC       = require("fs")
const Discord   = require('discord.js');
const { parse } = require("path");
const Jimp      = require("jimp");

const burn_item = async (uid, islot) => {
    islot--;
    const inv = await db.get_inventory(uid);
    if (!inv || !inv[islot])
        return await parser.send_uwarn(msg, "Belirtilen slotta item bulunamadı.");
        
    inv.splice(islot, 1);
    await db.set_inventory(uid, inv);
}
const wear_item = async (uid, islot) => {
    islot--;
    const inv = await db.get_inventory(uid);
    if (!inv || !inv[islot])
        return await parser.send_uwarn(msg, "Belirtilen slotta item bulunamadı.");
    
    let wear = await db.get_wear(uid);
    const item = await db.get_item(inv[islot]);
    if (!wear) wear = {};
    if (wear[item.Slot]) inv.push(wear[item.Slot]);
    wear[item.Slot] = item.Num;
    inv.splice(islot, 1);
    const p1 = db.set_wear(uid, wear);
    const p2 = db.set_inventory(uid, inv);
    await p1; await p2;
}
const map_wear = {
    /* ItemSlot1HEitherHand */  0  : 6,
	/* ItemSlot1HRightHand */	1  : 8,
	/* ItemSlot1HLeftHand */	2  : 6,
	/* ItemSlot2HRightHand */	3  : 8,
	/* ItemSlot2HLeftHand */	4  : 6,
	/* ItemSlotPauldron */		5  : 4,
	/* ItemSlotPads */		    6  : 10,
	/* ItemSlotHelmet */		7  : 1,
	/* ItemSlotGloves */		8  : 12,
	/* ItemSlotBoots */		    9  : 13,
	/* ItemSlotEarring */		10 : 0,
	/* ItemSlotNecklace */		11 : 3,
	/* ItemSlotRing */		    12 : 9,
	/* ItemSlotShoulder */		13 : 5,
	/* ItemSlotBelt */		    14 : 7,
}
const send_embed_item = async (msg, id) => await tools.send_embed_item(msg, id, state);
const render_inventory = async (inventory, iconspath, bgfile, wear) => {
    // l= length, oix= offset inventory x, ogx= offset gear x, iw= inventory width,
    // ih= inventory height, gw= gear width, gh= gear height
    const l=45, oix=0, oiy=1, ogx=7, ogy=0, iw=7, ih=4, gw=3, gh=5, LIMIT=iw*ih;
    const bg = await Jimp.read(iconspath+'/'+bgfile);
    const icons = await Promise.all((inventory ?? []).slice(0,LIMIT).map(async (id,i) => {
        let im = await Jimp.read(await tools.guard_iconpath(id));
        return { "i": i, "im": im };
    }));
    for (const {i, im} of icons) {
        const x=i%iw, y=(i/iw)|0;
        bg.composite(im, l*(oix+x), l*(oiy+y));
    }
    const wearicons = await Promise.all(Object.entries(wear ?? {}).map(async kv => {
        let im = await Jimp.read(await tools.guard_iconpath(kv[1]));
        return { "slot": kv[0], "im": im };
    }));
    const woix=iw, woiy=0, wiw=3, wih=5;
    for (const {slot, im} of wearicons) {
        const s = map_wear[slot] ?? 20;
        const x=s%wiw, y=(s/wiw)|0;
        bg.composite(im, l*(woix+x), l*(woiy+y));
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
            const rid = await tools.get_riid(state);
            await send_embed_item(msg, rid);
        }

        if (!parser.is(msg, state.prefix))
            return;

        if (msg.channel.id == cid.botkomutlari) {

            if (!parser.cooldown_user(state, msg.author.id, "bakkal_komut", 3)) {
                parser.send_uwarn(msg, "komutu tekrar kullanabilmek icin lutfen bekleyin");
                return;
            }

            if (parser.is(msg, "seviyeler")) {
                let out = (await tools.ensure(state, levelstb, db.get_levels)).reduce((a,c)=>a+=`${c.lvl}:${c.exp}\n`,'');
                msg.channel.send(parser.tqs(out));
            }
            else if (parser.is(msg, "giy ")) parser.u_arg(msg, async u => await wear_item(msg.author.id, u));
            else if (parser.is(msg, "sil ")) parser.u_arg(msg, async u => await burn_item(msg.author.id, u));
            else if (parser.is(msg, "profil")) {
                const premium = parser.is(msg,'p');
                parser.mention_else_self(msg, async id => {
                    if (parser.u_arg(msg, async sid => {
                        sid = sid - 1 // convert to zero-based index
                        const inv = await db.get_inventory(id);
                        if (sid >= inv.length) return await parser.send_uwarn(msg, `${sid+1} numarali slot bos`);
                        await send_embed_item(msg, inv[sid]);
                    }))
                        return;
                    
                    const user = msg.guild.members.cache.get(id).user;
                    const iname = `inventory${(premium ? '_premium' : '')}.png`;
                    // we have 2 different tasks that can be executed in parallel
                    // use promise all to execute them in paralel and wait for them.
                    const [explvl, image] = await Promise.all([
                        (async () => {
                            let l = 1;
                            const uexp = (await db.get_exp(id)).exp;
                            for (const level of await tools.ensure(state, levelstb, db.get_levels))
                                if (uexp < level.exp) break;
                                else l++;
                            return [uexp, l];
                        })(),
                        (async () => {
                            const inventory = db.get_inventory(id);
                            const wear = db.get_wear(id);
                            return await render_inventory(await inventory, iconpath, iname, await wear);
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
                parser.i_arg(msg, do_f, async ()=> await do_f(await tools.get_riid(state)));
            }
        }

        break;
    }
}