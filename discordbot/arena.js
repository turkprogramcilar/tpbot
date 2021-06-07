const tools = require("./tools.js");

const display_hits = 20;
let alive = [];
let purge_list = [];
let purge_timer = null;
exports.toggle_purge = msg => {
    purge_list.push(msg);
    if (!purge_timer) purge_timer = setTimeout(() => {
        const del = purge_list.splice(0,100);
        msg.channel.bulkDelete(del);
        purge_timer = null;
    }, exports.frequency*1000);
}
exports.spawn_rate = .1/3;
exports.buff = 1;
exports.frequency = 5;
exports.create = (dc, msg, name, id, hp) => {
    if (alive.length>0) return null;
    ch = msg.guild.channels.cache.get(cid_arena);
    if (ch) ch.send(embed(dc, name, id, hp, hp)).then((msg) => {
        alive.push({
            name: name, id: id, msg: msg, mhp: hp, hp: hp, 
            timestamp: 0, dmgdone: {}, lasthits: [],
        });
    });
}
// Anlik sunucuda en fazla exp 148k, yaklasik 0.6~ + 1 -> 1.6 kat fazla
// damage veriyor bu formul
exports.dmg = (xp) => Math.log(1*xp/200000+1);
exports.hit = async (dc, msg, gm=false,gmdmg=0) => {
    if (alive.length==0) return;
    dmg=(.3+Math.random()*.7)*100*exports.buff|0;
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
    now = new Date(); passed = (now - monster.timestamp) / 1000 | 0;
    if (passed >= exports.frequency) {
        //update
        sorted=Object.entries(monster.dmgdone).sort((a,b)=>b[1]-a[1])
        m=monster;
        const newmsg=embed(dc, m.name,m.id,m.hp,m.mhp,m.lasthits,sorted.splice(0,3),sorted.splice(-1,1)[0]);
        if (m.msg.deleted) m.msg = await msg.guild.channels.cache.get(cid_arena).send(newmsg);
        else m.msg.edit(newmsg);
        monster.timestamp = now;
    }
}
const embed = (dc, name, id, hp, mhp, lasthits=[], top=[], last='') => {

    // boyle yapmayinca bir sebepten dolayi calismiyordu belki de simdi t1..t4
    // yerine karsiliklarini yazinca calisabilir.
    t1=top[0]??"-"; t2=top[1]??"-"; t3=top[2]??"-"; t4=last??"-";

    return {
        content: ''+lasthits.reduce((a,c)=>a+=c+' ',''),
        embed: new dc.MessageEmbed()
        .setColor('#'+tools.hsv2rgbh(hp/mhp/3,1,1))
        .setTitle(title(name, hp,mhp))
        .setDescription(`\`\`\`Can: ${hp}/${mhp} (%${(hp/mhp*100)|0})\`\`\``)
        .addField('Birinci', t1, true)
        .addField('İkinci',  t2, true)
        .addField('Üçüncü',  t3, true)
        //.addField('Sonuncu', t4, true) bu calismiyor anlamadim.
        .setThumbnail(`https://cdn.discordapp.com/emojis/${id}.png`)
        .setTimestamp()
        .setFooter('%vur komutu ile düşmana saldır.')// Daha fazla hasar vermek için saldırını emojiler ile desteklendir!');
    };
}

const title = (name, hp, mhp) => {
    
    // pc=percentage
    pc=hp/mhp;
         if (pc <= 0) return `MEGA ${name} MAĞLUP EDİLDİ. TEBRİKLER! PUAN TABLOSU:`;
    else if (pc < .1) return `MEGA ${name} SON DEMLERİNİ YAŞIYOR!`;
    else if (pc < .3) return `MEGA ${name} ÖLMEK ÜZERE!!!`;
    else if (pc < .6) return `MEGA ${name} TP ÜYELERİ KARŞISINDA ZORLANIYOR!`;
    else if (pc < .9) return `MEGA ${name} TP ÜYELERİ TARAFINDAN KUŞATILDI.`;
    else              return `MEGA ${name} MEYDANA ÇIKTI.`;
}