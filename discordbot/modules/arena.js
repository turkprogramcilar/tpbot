const tools  = require("../tools.js");
const parser = require("./../cmdparser.js");
const db     = require("./../mongodb.js");

const Discord = require("discord.js");

let fetch_start = new Date();
let state = undefined;
exports.init = async (refState) => {
    state = refState;
    fetch_start = new Date();
    try {
        const json = (await db.get_arena()).alive;
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
            create(msg, match[1], match[2], 10000);
        }
        // messages send on arena (command or not, doesn't matter)
        if (msg.channel.id == cid.arena && delete_messages) toggle_purge(msg);

        // if not command anywhere, return
        if (!parser.is(msg, state.prefix)) {        
            return;
        }
        // command send on arena
        if (msg.channel.id == cid.arena) {
            if (parser.is(msg, "vur")) {
                hit(msg);
                return;
            }
        }

        // if not admin return
        if (groups.admins.includes(msg.author.id) == false)
            return;

        // gamemaster commands for arena
        if (!parser.is(msg, "gm_")) return;
        if (fetch_start) parser.send_tqswarn(msg, "alive array is still being fetched. "
            + `(start=${fetch_start}, now=${new Date()}`);

        if (parser.is(msg, "arena")) {
            delete_messages = !delete_messages;
            msg.channel.send(`Arenaya atilan tum mesajlari sil: ${delete_messages}`);
        }
        else if (parser.set_arg(msg, "buff",    f => buff = f,       "Arena hasar oranını düzenle"));
        else if (parser.set_arg(msg, "sans",    f => spawn_rate = f, "Arena emoji çıkma şansını düzenle"));
        else if (parser.set_arg(msg, "frekans", f => frequency = f,  "Arena güncelleme sıklığı (sn)"));
        else if (parser.set_arg(msg, "vur",     f => hit(msg, true, f)));
        else if (parser.is(msg, "yarat ")) {
            r = msg.content.match(/^<:([A-z]+):([0-9]+)>\s*([0-9]+)/)
            if (r) {
                id=r[2]; nm=r[1]; hp=parseInt(r[3]);
                if (!msg.guild.emojis.cache.get(id)) return;
                create(msg, nm, id, hp)
            }
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
// Anlik sunucuda en fazla exp 148k, yaklasik 0.6~ + 1 -> 1.6 kat fazla
// damage veriyor bu formul
const getdmg = (xp) => Math.log(1*xp/200000+1);

// following method is called everywhere where `alive` 
// variable is updated, basically updates the db in case
// any accidental shutdowns bot on heroku, whenever bot gets
// live, fetches the recent state of arena from db
const syncdb_alive = async () => {
    tools.toggler_async(async () => db.set_arena(JSON.stringify(alive)), "syncdb_alive", frequency*1000);
}

need_update = false;
const toggle_update = (f) => {
    tools.toggler(f, "arena_update", frequency*1000);
}
const toggle_purge = (msg) => {
    if (msg) purge_list.push(msg);
    tools.toggler(async () => {
        const del = purge_list.splice(0,100);
        await msg.channel.bulkDelete(del);
        // keep going until list is empty, even if not toggled by a message yet
        if (purge_list.length!=0) toggle_purge(msg);
    }, "arena_delete", frequency*1000);
}
const create = (msg, name, eid, hp) => {
    if (alive) return null;
    ch = msg.guild.channels.cache.get(cid.arena);
    if (ch) ch.send(embed(name, eid, hp, hp)).then((msg) => {
        alive = {
            name: name, eid: eid, msg: msg, mhp: hp, hp: hp, dmgdone: {}, lasthits: [],
        };
        syncdb_alive();
    })
    else throw "die";
}
const hit = async (msg, gm=false,gmdmg=0) => {
    if (!alive) return;
    dmg=(.3+Math.random()*.7)*400*buff|0;
    if (gm) dmg=gmdmg|0;
    uname=msg.author.username;
    if (alive.dmgdone[uname])
        alive.dmgdone[uname] += dmg;
    else
        alive.dmgdone[uname] = dmg;
    alive.hp-=dmg;
    if (alive.hp <= 0) {
        alive.hp = 0;
        alive.timestamp=0;
    }
    if (alive.lasthits.length==display_hits)
        alive.lasthits.shift();
    alive.lasthits.push('`'+uname+': '+dmg+'`');
    const m=alive;
    toggle_update(async ()=> {
        //update
        sorted=Object.entries(m.dmgdone).sort((a,b)=>b[1]-a[1]);
        const newmsg=embed(m.name,m.eid,m.hp,m.mhp,m.lasthits,sorted.splice(0,3),sorted.splice(-1,1)[0]);
        const mmsg = (await state.client.channels.cache.get(m.msg.channelID).messages.fetch(m.msg.id));
        if (mmsg.deleted) m.msg = await msg.guild.channels.cache.get(cid.arena).send(newmsg);
        else mmsg.edit(newmsg);
    })
    if (alive.hp <= 0) alive=undefined;
    syncdb_alive();
}
const embed = (name, eid, hp, mhp, lasthits=[], top=[], last='') => {

    // boyle yapmayinca bir sebepten dolayi calismiyordu belki de simdi t1..t4
    // yerine karsiliklarini yazinca calisabilir.
    t1=top[0]??"-"; t2=top[1]??"-"; t3=top[2]??"-"; t4=last??"-";

    return {
        content: ''+lasthits.reduce((a,c)=>a+=c+' ',''),
        embed: new Discord.MessageEmbed()
        .setColor('#'+tools.hsv2rgbh(hp/mhp/3,1,1))
        .setTitle(title(name, hp,mhp))
        .setDescription(`\`\`\`diff\n+ ${hp}/${mhp} (%${(hp/mhp*100)|0})\`\`\``)
        .addField('`Birinci`', t1[0]+(top[0]?`\`\`\`md\n# ${t1[1]} (%${(t1[1]/mhp*100)|0})\`\`\``:''), true)
        .addField('`İkinci`',  t2[0]+(top[1]?`\`\`\`md\n# ${t2[1]} (%${(t2[1]/mhp*100)|0})\`\`\``:''), true)
        .addField('`Üçüncü`',  t3[0]+(top[2]?`\`\`\`md\n# ${t3[1]} (%${(t3[1]/mhp*100)|0})\`\`\``:''), true)
        //.addField('Sonuncu', t4, true) bu calismiyor anlamadim.
        .setThumbnail(`https://cdn.discordapp.com/emojis/${eid}.png`)
        .setTimestamp()
        .setFooter('%vur komutu ile düşmana saldır.')// Daha fazla hasar vermek için saldırını emojiler ile desteklendir!');
    };
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