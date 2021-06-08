const tools = require("../tools.js");
const parse = require("./../cmdparser.js");
const php   = require("./../php.js");

const Discord = require("discord.js");

let state = undefined;
exports.init = (refState) => state = refState;
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
        if (msg.channel.id == cid_arena) toggle_purge(msg);

        // if not command anywhere, return
        if (!parse.is(msg, state.prefix)) {        
            return;
        }
        // command send on arena
        if (msg.channel.id == cid_arena) {
            if (parse.is(msg, "vur")) {
                hit(msg);
                return;
            }
        }
        // if not admin return
        if (uid_admins.includes(msg.author.id) == false)
            return;

        // gamemaster commands for arena
        if (!parse.is(msg, "gm_")) return;
        if (parse.is(msg, "arena")) {
            toggle = !toggle;
            msg.channel.send(`Arenaya atilan tum mesajlari sil: ${state.arena_toggle}`);
        }
        else if (parse.set_arg(msg, "buff",    f => buff = f,       "Arena hasar oranını düzenle"));
        else if (parse.set_arg(msg, "sans",    f => spawn_rate = f, "Arena emoji çıkma şansını düzenle"));
        else if (parse.set_arg(msg, "frekans", f => frequency = f,  "Arena güncelleme sıklığı (sn)"));
        else if (parse.set_arg(msg, "vur",     f => hit(msg, true, f)));
        else if (parse.is(msg, "yarat ")) {
            r = msg.content.match(/^<:([A-z]+):([0-9]+)>\s*([0-9]+)/)
            if (r) {
                id=r[2]; nm=r[1]; hp=parseInt(r[3]);
                if (!msg.guild.emojis.cache.get(id)) return;
                create(msg, nm, id, hp)
            }
        }
        else if (parse.is(msg, "dmg ")) r_arg(msg, /^[0-9]+/, async n => {
            xp = await php.get_exp(n);
            msg.channel.send(`Exp: ${xp} | Dmg: ${dmg(xp)}`);
        })
        else if (parse.is(msg, "expall")) {
            const Guild = msg.guild;
            const Members = Guild.members.cache.map(member => member.id); // Getting the members and mapping them by ID.
            exps = [];
            const process_text = "Bu biraz zaman alacak... ";
            const process_msg = msg.channel.send(process_text);
            let i = 0;
            const members = await msg.guild.members.fetch(); 
            const mn = members.array().length;
            for (const member of members) {
                if (i % 50 == 0) (await process_msg).edit(process_text+`${i}\\${mn}`);
                i++;
                exps.push({name: member[1].user.username, exp: await php.get_exp(member[0])});
            }
            exps.sort((a, b) => -1*(a.exp - b.exp));
            const table = exps.reduce((a,c)=>a+=`${c.name}: ${c.exp} | `, '');
            (await process_msg).edit('```'+table.substring(0,2000-1-6)+'```');
        }
        break;
    }
}




const display_hits = 20;
let alive = [];
let purge_list = [];
let purge_timer = null;
let update_timer = null;
let toggle = true;
let spawn_rate = .1/3;



let buff = 1;
let frequency = 5;
// Anlik sunucuda en fazla exp 148k, yaklasik 0.6~ + 1 -> 1.6 kat fazla
// damage veriyor bu formul
const getdmg = (xp) => Math.log(1*xp/200000+1);

need_update = false;
const toggle_update = (f) => {
    if (!update_timer) {
        f();
        need_update = false;
        update_timer = setTimeout(() => {
            update_timer = null;
            if (need_update) toggle_update(f);
        }, frequency*1000);
    } else {
        need_update = true;
    }
}
const toggle_purge = msg => {
    purge_list.push(msg);
    if (!purge_timer) purge_timer = setTimeout(() => {
        const del = purge_list.splice(0,100);
        msg.channel.bulkDelete(del);
        purge_timer = null;
    }, frequency*1000);
}
const create = (msg, name, id, hp) => {
    if (alive.length>0) return null;
    ch = msg.guild.channels.cache.get(cid_arena);
    if (ch) ch.send(embed(name, id, hp, hp)).then((msg) => {
        alive.push({
            name: name, id: id, msg: msg, mhp: hp, hp: hp, dmgdone: {}, lasthits: [],
        });
    });
}
const hit = async (msg, gm=false,gmdmg=0) => {
    if (alive.length==0) return;
    dmg=(.3+Math.random()*.7)*400*buff|0;
    if (gm) dmg=gmdmg|0;
    monster=alive[0];
    uname=msg.author.username;
    if (monster.dmgdone[uname])
        monster.dmgdone[uname] += dmg;
    else
        monster.dmgdone[uname] = dmg;
    monster.hp-=dmg;
    if (monster.hp <= 0) {
        monster.timestamp=0;
        alive=[];
    }
    if (monster.lasthits.length==display_hits)
        monster.lasthits.shift();
    monster.lasthits.push('`'+uname+': '+dmg+'`');
    toggle_update(async ()=> {
        //update
        sorted=Object.entries(monster.dmgdone).sort((a,b)=>b[1]-a[1])
        m=monster;
        const newmsg=embed(m.name,m.id,m.hp,m.mhp,m.lasthits,sorted.splice(0,3),sorted.splice(-1,1)[0]);
        if (m.msg.deleted) m.msg = await msg.guild.channels.cache.get(cid_arena).send(newmsg);
        else m.msg.edit(newmsg);
    })
}
const embed = (name, id, hp, mhp, lasthits=[], top=[], last='') => {

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
        .setThumbnail(`https://cdn.discordapp.com/emojis/${id}.png`)
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