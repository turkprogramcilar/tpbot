const tools  = require("../tools.js");
const parser = require("./../cmdparser.js");
const db     = require("./../mongodb.js");

const Jimp    = require("jimp");
const fs      = require("fs").promises;
const Discord = require("discord.js");

const render_drop = async (items, path, bgfile) => {
    const bg = await Jimp.read(path+'/'+bgfile);
    const icons = await Promise.all(items.map(async (id,i) => {
        let im = await Jimp.read(await tools.guard_iconpath(id));
        return { "i": i, "im": im };
    }));
    const ox=90, oy=13, s=22, l=45;
    for (const {i, im} of icons) {
        bg.composite(im, ox+i*(l+s), oy);
    }
    return await bg.getBufferAsync(Jimp.MIME_PNG);
}

let fetch_start = new Date();
let state = undefined;
exports.init = async (refState) => {
    state = refState;
    fetch_start = new Date();
    try {
        const json = (await db.get_module_state("kolezyum"));
        alive = JSON.parse(json);
    } catch {
        alive = undefined;
    } finally {
        fetch_start = undefined;
    }
}
exports.on_event = async (evt, args) => {
    switch (evt) {

    case 'message':
        const msg = args.msg;
        
        // test if this message contains emoji and spawns mega emoji
        if ((match = msg.content.match(/<:([A-z]+):([0-9]+)>/))
        && Math.random() < spawn_rate
            ) {
            await create(msg, match[1], match[2], 10000);
        }

        // if not command in kolezyum, return
        if (msg.channel.id != cid.kolezyum) {        
            return;
        }
        
        // messages send on kolezyum (command or not, doesn't matter)
        if (delete_messages) toggle_purge(msg);

        // vur command send on kolezyum
        if (parser.is(msg, "vur")) {
            hit(msg);
            return;
        }

        // if not admin return
        if (groups.admins.includes(msg.author.id) == false)
            return;

        // gamemaster commands for kolezyum
        if (!parser.is(msg, "gm_")) return;
        if (fetch_start) parser.send_awarn(msg, "alive array is still being fetched. "
            + `(start=${fetch_start}, now=${new Date()}`);

        if (parser.is(msg, "kolezyum")) {
            delete_messages = !delete_messages;
            msg.channel.send(`Kolezyumya atilan tum mesajlari sil: ${delete_messages}`);
        }
        else if (parser.set_arg(msg, "buff",    f => buff = f,       "Kolezyum hasar oranını düzenle"));
        else if (parser.set_arg(msg, "sans",    f => spawn_rate = f, "Kolezyum emoji çıkma şansını düzenle"));
        else if (parser.set_arg(msg, "frekans", f => frequency = f,  "Kolezyum güncelleme sıklığı (sn)"));
        else if (parser.set_arg(msg, "vur",     f => hit(msg, true, f)));
        else if (parser.is(msg, "yarat ")) {
            r = msg.content.match(/^<:([A-z]+):([0-9]+)>\s*([0-9]+)/)
            if (r) {
                id=r[2]; nm=r[1]; hp=parseInt(r[3]);
                if (!msg.guild.emojis.cache.get(id)) return;
                await create(msg, nm, id, hp)
            }
        }
        else if (parser.is(msg, "yoket")) {
            
            await parser.send_uwarn(msg, `Yokediliyor... [alive: ${alive?.name ?? "<yok>"}]`);
            alive = undefined;
        }
        /*else if (parser.is(msg, "dmg ")) r_arg(msg, /^[0-9]+/, async n => {
            xp = await php.get_exp(n);
            msg.channel.send(`Exp: ${xp} | Dmg: ${dmg(xp)}`);
        })*/
        break;
    }
}




const display_hits = 20;
let alive = undefined;
let purge_list = [];
let delete_messages = true;
let spawn_rate = .01;



let buff = 1;
let frequency = 3;

// following method is called everywhere where `alive` 
// variable is updated, basically updates the db in case
// any accidental shutdowns bot on heroku, whenever bot gets
// live, fetches the recent state of kolezyum from db
const syncdb_alive = async () => {
    tools.sync_module("kolezyum", ()=>alive, frequency*1000);
}

need_update = false;
const toggle_update = (f) => {
    tools.toggler(f, "kolezyum_update", frequency*1000);
}
const toggle_purge = (msg) => {
    if (msg) purge_list.push(msg);
    tools.toggler(async () => {
        const del = purge_list.splice(0,100);
        await msg.channel.bulkDelete(del);
        // keep going until list is empty, even if not toggled by a message yet
        if (purge_list.length!=0) toggle_purge(msg);
    }, "kolezyum_delete", frequency*1000);
}
const create = async (msg, name, eid, hp) => {
    if (alive) return null;
    ch = msg.guild.channels.cache.get(cid.kolezyum);
    if (ch) ch.send(await embed_boss(name, eid, hp, hp)).then((msg) => {
        alive = {
            name: name, eid: eid, msg: msg, mhp: hp, hp: hp, dmgdone: {}, lasthits: [],
        };
        syncdb_alive();
    })
    else throw "die";
}
const hit = async (msg, gm=false,gmdmg=0) => {
    if (!alive) return;

    const uname = msg.author.username;
    const uid   = msg.author.id;

    //60 second is to allow spam dmg formula to init at full power
    const init_diff = 60*1000;

    // if stats are not fetched, fetch them first
    if (!alive.dmgdone[uid]) {

        // query in paralel
        const promise_stats = db.get_user_value(uid, "stats");
        const promise_exp   = db.get_user_value(uid, "exp");
        alive.dmgdone[uid] = {
            name: uname, 
            "dmg": 0,
            "stats": await promise_stats,
            "exp": await promise_exp,
            "timestamp": new Date()-init_diff
        };
    }
    const user = alive.dmgdone[uid];
    const idmg = user?.stats?.Damage ?? 0;
    const expm = tools.getexpm(user?.exp ?? 0);
    
    // calculate time difference for dmg calculation
    const now = new Date();
    const time_diff = (now-(user.timestamp ?? (now - init_diff)))/1000;
    // get base damage
    const base_dmg = tools.base_dmg(idmg, expm);
    // get final damage
    const final_dmg = (!gm ? tools.final_dmg(base_dmg, time_diff)*buff : gmdmg)|0;

    // update user damage hit statistics
    user.timestamp = now;
    user.dmg += final_dmg;

    // update mega emoji health
    alive.hp-=final_dmg;
    if (alive.hp <= 0) {
        alive.hp = 0;
        alive.timestamp=0;
    }
    if (alive.lasthits.length==display_hits)
        alive.lasthits.shift();
    alive.lasthits.push('`'+uname+': '+final_dmg+'`');
    const m=alive;
    toggle_update(async ()=> {
        //update
        const sorted  = Object.entries(m.dmgdone).sort((a,b)=>b[1].dmg-a[1].dmg);
        const top3    = sorted.splice(0,3);
        const drops   = m.hp > 0 ? [] : await Promise.all(top3.map(x=>tools.get_riid(state)));
        const newmsg  = await embed_boss(m.name,m.eid,m.hp,m.mhp,
                                         m.lasthits,top3,sorted.splice(-1,1)[0],
                                         drops);
        const channel = (await state.client.channels.fetch(m.msg.channelID ?? m.msg.channel.id));
        let mmsg 
        try {
            mmsg = await channel.messages.fetch(m.msg.id);
        }
        catch {
            mmsg = undefined;
        }
        if (!mmsg || (mmsg.deleted && m.hp > 0)) m.msg = await channel.send(newmsg);
        else {
            if (m.hp <= 0) {
                await mmsg.delete();
                const sendmsg = channel.send(newmsg);
                let promises = top3.map((x,i)=>db.give_item(x[0], drops[i]));
                promises.push(sendmsg);
                await Promise.all(promises);
            }
            else mmsg.edit(newmsg);
        }
    })
    if (alive.hp <= 0) alive=undefined;
    syncdb_alive();
}
const embed_boss = async (name, eid, hp, mhp, lasthits=[], top=[], last='', drops=[]) => {

    // boyle yapmayinca bir sebepten dolayi calismiyordu belki de simdi t1..t4
    // yerine karsiliklarini yazinca calisabilir.
    t1=top[0]; t2=top[1]; t3=top[2]; t4=last;

    let embed = new Discord.MessageEmbed()
        .setColor('#'+tools.hsv2rgbh(hp/mhp/3,1,1))
        .setTitle(title(name, hp,mhp))
        .setDescription(`\`\`\`diff\n+ ${hp}/${mhp} (%${(hp/mhp*100)|0})\`\`\``)
        .addField('`Birinci`', !t1?"-":t1[1]?.name+(`\`\`\`md\n# ${t1[1].dmg} (%${(t1[1].dmg/mhp*100)|0})\`\`\``), true)
        .addField('`İkinci`',  !t2?"-":t2[1]?.name+(`\`\`\`md\n# ${t2[1].dmg} (%${(t2[1].dmg/mhp*100)|0})\`\`\``), true)
        .addField('`Üçüncü`',  !t3?"-":t3[1]?.name+(`\`\`\`md\n# ${t3[1].dmg} (%${(t3[1].dmg/mhp*100)|0})\`\`\``), true)
        //.addField('Sonuncu', t4, true) bu calismiyor anlamadim.
        .setThumbnail(`https://cdn.discordapp.com/emojis/${eid}.png`)
        .setTimestamp()
        .setFooter('vur komutu ile düşmana saldır.')// Daha fazla hasar vermek için saldırını emojiler ile desteklendir!');
    ;
    
    msg = {
        content: ''+lasthits.reduce((a,c)=>a+=c+' ',''),
        embeds: [embed]
    };

    if (hp==0 || true) {
        const fname = "kolezyumdrop.png";
        msg.files = [{
            attachment: (hp<=0 
                ? await render_drop(drops,uipath,fname)
                : await fs.readFile(uipath+"/"+fname)),
            name: fname
        }]
        msg.embeds[0] = msg.embeds[0].setImage("attachment://"+fname);
    }
    if (msg.content.length == 0) msg.content = "-";
    return msg;
}

const title = (name, hp, mhp) => {
    
    // pc=percentage
    pc=hp/mhp;
         if (pc <= 0) return `MEGA ${name} MAĞLUP EDİLDİ.`;
    else if (pc < .1) return `MEGA ${name} SON DEMLERİNİ YAŞIYOR!`;
    else if (pc < .3) return `MEGA ${name} ÖLMEK ÜZERE!!!`;
    else if (pc < .6) return `MEGA ${name} TP ÜYELERİ KARŞISINDA ZORLANIYOR!`;
    else if (pc < .9) return `MEGA ${name} TP ÜYELERİ TARAFINDAN KUŞATILDI.`;
    else              return `MEGA ${name} MEYDANA ÇIKTI.`;
}