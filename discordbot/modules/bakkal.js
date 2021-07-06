require("./../constants.js");
const db     = require("./../mongodb.js");
const parser = require("./../cmdparser.js");
const tools  = require("../tools.js");

const fs        = require("fs").promises;
const fsC       = require("fs")
const Discord   = require('discord.js');
const { parse } = require("path");
const Jimp      = require("jimp");

const take_off_items = async (uid) => {
    const wear = await db.get_wear(uid);
    const inv  = await db.get_inventory(uid);
    for (const [key, value] of Object.entries(wear)) {
        inv.push(value);
    }
    const p1 = db.set_wear(uid, {});
    const p2 = db.set_inventory(uid, inv);
    const p3 = db.set_user_value(uid, "stats", {});
    await p1; await p2; await p3;
}
const burn_item = async (uid, islot) => {
    islot--;
    const inv = await db.get_inventory(uid);
    if (!inv || !inv[islot])
        return await parser.send_uwarn(msg, "Belirtilen slotta item bulunamadı.");
        
    inv.splice(islot, 1);
    await db.set_inventory(uid, inv);
}
const wear_item = async (uid, islot, msg) => {
    islot--;
    const inv = await db.get_inventory(uid);
    if (!inv || !inv[islot])
        return await parser.send_uwarn(msg, "Belirtilen slotta item bulunamadı.");
    
    let wear = await db.get_wear(uid);
    const iplus = inv[islot];
    const i0 = tools.i0(iplus);
    const item = await db.get_item(i0);

    // if wear is undefined, then lets first define it for the first time.
    if (!wear) wear = {};

    const target_slots = slot_to_wear[item.Slot];
    if (target_slots == undefined) return await parser.send_uwarn(msg, "Belirtilen slottaki item giyilemez");
    if (target_slots.length == 1) {
        const target_first = target_slots[0];
        // if slot is occupied, put it back to the inventory first
        if (wear[target_first]) {
            inv.push(wear[target_first]);
            // if it is a double slot and target is two handed, put the second slot
            // back at inventory too if there's an item
            const target_second = double_slots[target_first];
            if (target_second && wear[target_second]) {
                inv.push(wear[target_second]);
                delete wear[target_second];
            }
        }
        // wear the item at slot
        wear[target_first] = iplus;
    }
    else if (target_slots.length == 2) {
        const target_first  = target_slots[0];
        const target_second = target_slots[1];
        // if 1st slot is occupied, look for second slot
        if (wear[target_first]) {
            // if 2nd slot is occupied, put it back to the inventory first
            if (wear[target_second]) {    
                inv.push(wear[target_second]);
            }
            wear[target_second] = iplus;
        }
        // if 1st slot is not occupied, just simply wear it
        else {
            // if 2nd slot is occupied, put it back to the inventory first
            if (wear[target_second]) {    
                inv.push(wear[target_second]);
                delete wear[target_second];
            }
            // wear the item at slot
            wear[target_first] = iplus;
        }
    }
    else {
        console.error(`can_wear length is not 1 or 2, it is = ${target_slots.length}`);
        return;
    }
    // remove the item from inventory
    inv.splice(islot, 1);
    const p1 = db.set_wear(uid, wear);
    const p2 = db.set_inventory(uid, inv);
    // calculate stats
    const pluses_worn = Object.values(wear)
    const items_raw = await Promise.all(pluses_worn.map(iid => db.get_item(tools.i0(iid))));
    const stats = {};
    for (const stat_key of item_stats) {

        const stat_total = items_raw.reduce( (a, item, i) => {
            
            let stat_value = (item[stat_key] ?? 0);
            if (!Number.isSafeInteger(stat_value)) stat_value = 0;
            return a += tools.iplus_stat(pluses_worn[i], stat_value)
        }, 0);
        stats[stat_key] = stat_total;
    }
    const p3 = db.set_user_value(uid, "stats", stats);
    await p1; await p2; await p3;
}
const double_slots = {
    6: 8,
    0: 2,
    9: 11,
    8: 6,
    2: 0,
    11: 9,
};
const item_stats = [
   "Damage", "Weight", "Ac", "Hitrate", "Evasionrate", "DaggerAc", "SwordAc", "MaceAc", "AxeAc", "SpearAc", "BowAc", "FireDamage", "IceDamage", "LightningDamage", "PoisonDamage", "HPDrain", "MPDamage", "MPDrain", "MirrorDamage", "StrB", "StaB", "DexB", "IntelB", "ChaB", "MaxHpB", "MaxMpB", "FireR", "ColdR", "LightningR", "MagicR", "PoisonR", "CurseR"
    // all original:
    //"Num", "strName", "Kind", "Slot", "Race", "Class", "Damage", "Delay", "Range", "Weight", "Duration", "BuyPrice", "SellPrice", "Ac", "Countable", "Effect1", "Effect2", "ReqLevel", "ReqLevelMax", "ReqRank", "ReqTitle", "ReqStr", "ReqSta", "ReqDex", "ReqIntel", "ReqCha", "SellingGroup", "ItemType", "Hitrate", "Evasionrate", "DaggerAc", "SwordAc", "MaceAc", "AxeAc", "SpearAc", "BowAc", "FireDamage", "IceDamage", "LightningDamage", "PoisonDamage", "HPDrain", "MPDamage", "MPDrain", "MirrorDamage", "Droprate", "StrB", "StaB", "DexB", "IntelB", "ChaB", "MaxHpB", "MaxMpB", "FireR", "ColdR", "LightningR", "MagicR", "PoisonR", "CurseR"
];
const slot_to_wear = {
    /* ItemSlot1HEitherHand */  0  : [6, 8],
	/* ItemSlot1HRightHand */	1  : [8],
	/* ItemSlot1HLeftHand */	2  : [6],
	/* ItemSlot2HRightHand */	3  : [8],
	/* ItemSlot2HLeftHand */	4  : [6],
	/* ItemSlotPauldron */		5  : [4],
	/* ItemSlotPads */		    6  : [10],
	/* ItemSlotHelmet */		7  : [1],
	/* ItemSlotGloves */		8  : [12],
	/* ItemSlotBoots */		    9  : [13],
	/* ItemSlotEarring */		10 : [0, 2],
	/* ItemSlotNecklace */		11 : [3],
	/* ItemSlotRing */		    12 : [9, 11],
	/* ItemSlotShoulder */		13 : [5],
	/* ItemSlotBelt */		    14 : [7],
}
const is_wearable = (item_slot) => Object.keys(slot_to_wear).map(x=>parseInt(x)).includes(item_slot);
const scroll_ids = [
    37901600,
    37901700,
    37901800,
    37901900,
    37902000,
    37902100,
    37902200,
    37902300,
    37902400,
    37902500,
];
const trina_id = 70000200;
const key_ids = [
    91004500,
    91005100,
    38910100,
    38910200,
    38910300,
    38910400,
    37911100,
    37908200,
    37908300,
    37908400,
    37908000,
    37908100,
];
const upgrade_chance = {
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.0,
    5: 1.0,
    6:  .8,
    7:  .4,
    8:  .2,
    9:  .1,
}
const send_embed_item = async (msg, id) => await tools.send_embed_item(msg, id, state);
const render_inventory = async (inventory, iconspath, bgfile, wear) => {
    // l= length, oix= offset inventory x, ogx= offset gear x, iw= inventory width,
    // ih= inventory height, gw= gear width, gh= gear height
    const l=45, oix=0, oiy=1, ogx=7, ogy=0, iw=7, ih=4, gw=3, gh=5, LIMIT=iw*ih;
    const bg = await Jimp.read(iconspath+'/'+bgfile);
    const icons = await Promise.all((inventory ?? []).slice(0,LIMIT).map(async (id,i) => {
        let im = await Jimp.read(await tools.guard_iconpath(tools.i0(id)));
        return { "i": i, "im": im };
    }));
    for (const {i, im} of icons) {
        const x=i%iw, y=(i/iw)|0;
        bg.composite(im, l*(oix+x), l*(oiy+y));
    }
    const wearicons = await Promise.all(Object.entries(wear ?? {}).map(async kv => {
        let im = await Jimp.read(await tools.guard_iconpath(tools.i0(kv[1])));
        return { "slot": kv[0], "im": im };
    }));
    const woix=iw, woiy=0, wiw=3, wih=5;
    for (const {slot, im} of wearicons) {
        const s = slot ?? 20;
        const x=s%wiw, y=(s/wiw)|0;
        bg.composite(im, l*(woix+x), l*(woiy+y));
    }
    return await bg.getBufferAsync(Jimp.MIME_PNG);
}

const get_lock = (uid) => {
    return state.cache.module["bakkal"].locks[uid];
}
const set_lock = (uid, key) => {
    state.cache.module["bakkal"].locks[uid] = key;
}
let state = undefined;
exports.init = (refState) => {
    state = refState;
    state.cache.module["bakkal"] = {
        locks: {},
    };
}
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

            if (!parser.cooldown_user(state, msg.author.id, "bakkal_komut", 2)) {
                parser.send_uwarn(msg, "komutu tekrar kullanabilmek icin lutfen bekleyin");
                return;
            }

            if (parser.is(msg, "seviyeler")) {
                let out = (await tools.ensure(state, levelstb, db.get_levels)).reduce((a,c)=>a+=`${c.lvl}:${c.exp}\n`,'');
                msg.channel.send(parser.tqs(out));
            }

            // beyond requires lock, if user's inventory is not locked, then proceed
            if (get_lock(msg.author.id))
                return await parser.send_uwarn(msg, "Bir onceki islem devam etmektedir. Lutfen bekleyiniz");
            
            // lock the inventory operation before completion to prevent
            // item losses or duplications
            set_lock(msg.author.id, true);

            if (parser.is(msg, "giy ")) await parser.u_arg(msg, async u => await wear_item(msg.author.id, u, msg));
            else if (parser.is(msg, "soyun")) await take_off_items(msg.author.id);
            else if (parser.is(msg, "yukselt")) {

                const str = "Kullanim: %yukselt <yükseltme kağıdı slot no> <yükselcek item slot no>";

                await parser.u_arg(msg, async islot_scroll => {

                    await parser.u_arg(msg, async islot_item => {

                        //

                        // get the item from the slot
                        const inv = await db.get_inventory(msg.author.id);
                        for (let islot of [islot_scroll, islot_item]) {
                            islot--;
                            if (!inv || !inv[islot])
                                return await parser.send_uwarn(msg, "Belirtilen slotta item bulunamadı.");
                        }
                        islot_scroll--; islot_item--;

                        if (!scroll_ids.includes(inv[islot_scroll]))
                            return await parser.send_uwarn(msg, "Belirtilen item yükseltme kağıdı değildir.");

                        const upgrading_item = await db.get_item(inv[islot_item]);
                        if (!is_wearable(upgrading_item["Slot"]))
                            return await parser.send_uwarn(msg, "Belirtilen item yükseltilebilir bir item değildir.");
                        //
                        console.log("OK");

                    }, async () => await parser.send_uwarn(msg, str));

                }, async () => await parser.send_uwarn(msg, str));
            }
            else if (parser.is(msg, "anektar ")) await parser.u_arg(msg, async islot => {
                
                // get client from module state
                const client = state.client;

                // get the item from the slot
                islot--;
                const inv = await db.get_inventory(msg.author.id);
                if (!inv || !inv[islot])
                    return await parser.send_uwarn(msg, "Belirtilen slotta item bulunamadı.");

                if (!key_ids.includes(inv[islot]))
                    return await parser.send_uwarn(msg, "Belirtilen item anektar değildir.");
                    
                // remove the key item from inventory            
                inv.splice(islot, 1);

                // pick a random item
                const rid = await tools.get_riid(state);

                // give the item to the user
                inv.push(rid);
                
                const promise_update_db = db.set_inventory(msg.author.id, inv);

                const user = await client.users.fetch(msg.author.id);
                await msg.channel.send(new Discord.MessageEmbed()
                    .setDescription(parser.tqs("Anektarını gırdındın. Ahanda rastgele çıkan item şudur:"))
                    .setAuthor(user.username, user.avatarURL())
                    .setThumbnail(client.user.avatarURL())
                );
                await tools.send_embed_item(msg, rid, state);

                await promise_update_db;
            });
            else if (parser.is(msg, "sil ")) await parser.u_arg(msg, async u => await burn_item(msg.author.id, u));
            else if (parser.is(msg, "envanter")) {
                await parser.mention_else_self(msg, async id => {
                    
                    const user = msg.guild.members.cache.get(id).user;
                    

                    const pi = db.get_inventory(id);
                    const pw = db.get_wear(id);
                    const inventory = await pi;
                    const wear = await pw;

                    // calculate stats
                    const pluses_worn = Object.values(wear)
                    const pluses_have = Object.values(inventory);
                    const p_worn_raw = Promise.all(pluses_worn.map(iid => db.get_item(tools.i0(iid))));
                    const p_have_raw = Promise.all(pluses_have.map(iid => db.get_item(tools.i0(iid))));
                    const worn_raw = await p_worn_raw;
                    const have_raw = await p_have_raw;
	            const _text = (c, k, text) => c[k] ? " ["+text+": " + c[k] + "]" : "";
                    const text_worn = worn_raw.reduce((a, c, i) => a+=`${i+1}.\t${c["strName"]} ${(tools.iplus(pluses_worn[i])>0?` (+${tools.iplus(pluses_worn[i])})`:"")}${_text(c, "Damage", "Hasar")}${_text(c, "Ac", "Zırh")}\n`,"");
                    const text_have = have_raw.reduce((a, c, i) => a+=`${i+1}.\t${c["strName"]} ${(tools.iplus(pluses_have[i])>0?` (+${tools.iplus(pluses_have[i])})`:"")}${_text(c, "Damage", "Hasar")}${_text(c, "Ac", "Zırh")}\n`,"");

                    let embed = new Discord.MessageEmbed()
                    .setTitle("`"+user.username+"`")
                    .setDescription(parser.tqs(`[Envanterdeki eşyalar]\n${text_have}\n\n[Giyilen eşyalar]\n${text_worn}`, "ini"))
                    .setThumbnail(user.avatarURL());

                    await msg.channel.send({
                        embed: embed
                    });
                });
            }
            else if (parser.is(msg, "profil")) {
                const premium = parser.is(msg,'p');
                await parser.mention_else_self(msg, async id => {

                    // if an item at slot is requested to display
                    if (await parser.u_arg(msg, async sid => {
                        sid = sid - 1 // convert to zero-based index
                        const inv = await db.get_inventory(id);
                        if (sid >= inv.length) return await parser.send_uwarn(msg, `${sid+1} numarali slot bos`);
                        await send_embed_item(msg, inv[sid]);
                    }))
                        return set_lock(msg.author.id, false);
                    
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
                    const stats = await db.get_user_value(id, "stats");

                    const expm = tools.getexpm(uexp??0);
                    const idmg = stats?.Damage ?? 0;
                    const base_dmg = tools.base_dmg(idmg, expm);

                    let embed = new Discord.MessageEmbed()
                    .setTitle("`"+user.username+"`")
                    .setDescription(parser.tqs(`Exp: {${uexp}} [Lvl: ${lvl}]\nHasar çarpanı: {${expm.toFixed(2)}}`,"css"))
                    .setThumbnail(user.avatarURL())
                    .setImage(`attachment://${iname}`);

                    // display all item stats on the player
                    const max_str_len = item_stats.map(x=>x.length).reduce((a,c)=>a=a>c?a:c,0);
                    let all_item_stats = ""; let counter = 0;
                    for (const [item_stat_key, item_stat_value] of Object.entries(stats ?? {})) {
                        let spacing_length = max_str_len-item_stat_key.length-item_stat_value.toString().length;
                        spacing_length = spacing_length < 0 ? 0 : spacing_length;
                        const spacing = Array(spacing_length).fill(" ").reduce((a,c)=>a+=c,"");
                        all_item_stats += `[${item_stat_key.replace(/^\w/, c => c.toUpperCase())}]: ${item_stat_value}`+spacing;
                        if (++counter % 2 == 0) {
                            all_items_stats = all_item_stats.slice(0, -spacing_length);
                            all_item_stats += "\n";
                        }
                    }
                    if (all_item_stats == "") all_item_stats = "-";
                    embed = embed
                        .addField("`Ortalama Hasar`", base_dmg|0, true)
                        .addField("`Maksimum Hasar`", base_dmg*2|0, true)
                        .addField(`\`Eşyalardan gelen güçler:\``, parser.tqs(all_item_stats, "ini"));
                    await msg.channel.send({
                        files: [{
                            attachment: image,
                            name: iname
                        }],
                        embed: embed
                    });
                });
            }

            // unlock the inventory operation after completion
            set_lock(msg.author.id, false);
            
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
