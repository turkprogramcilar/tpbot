let alive = [];
exports.buff = 1;
exports.frequency = 3;
exports.create = (dc, msg, name, id, hp) => {
    if (alive.length>0) return null;
    ch = msg.guild.channels.cache.get(cid_arena);
    if (ch) ch.send(embed(dc, name, id, hp, hp)).then((msg) => {
        alive.push({
            name: name,
            id: id,
            msg: msg, 
            mhp: hp,
             hp: hp,
            lasthit: +new Date(),
            dmgdone: {},
        });
    });
}
exports.hit = (dc, msg, gm=false,gmdmg=0) => {
    if (alive.length==0) return;
    dmg=Math.random()*100*exports.buff|0;
    if (gm) dmg=gmdmg;
    monster=alive[0];
    uname=msg.author.username;
    if (monster.dmgdone[uname])
        monster.dmgdone[uname] += dmg;
    else
        monster.dmgdone[uname] = dmg;
    monster.hp-=dmg;
    msg.delete();
    if (monster.hp <= 0) {
        monster.lasthit=0;
        alive=[];
    }
    now = new Date(); passed = (now - monster.lasthit) / 1000 | 0;
    if (passed >= exports.frequency) {
        //update
        sorted=Object.entries(monster.dmgdone).sort((a,b)=>b[1]-a[1])
        m=monster;
        m.msg.edit(embed(dc, m.name,m.id,m.hp,m.mhp,sorted.splice(0,3),sorted.splice(-1,1)[0]));
        monster.lasthit = now;
    }
}
const embed = (dc, name, id, hp, mhp, top=[], last='') => {

    // boyle yapmayinca bir sebepten dolayi calismiyordu belki de simdi t1..t4
    // yerine karsiliklarini yazinca calisabilir.
    t1=top[0]??"-"; t2=top[1]??"-"; t3=top[2]??"-"; t4=last??"-";

    return new dc.MessageEmbed()
        .setColor('#F80000')
        .setTitle(title(name, hp,mhp))
        .setDescription(`Can: ${hp}/${mhp}`)
        .addField('Birinci', t1, true)
        .addField('İkinci',  t2, true)
        .addField('Üçüncü',  t3, true)
        //.addField('Sonuncu', t4, true) bu calismiyor anlamadim.
        .setThumbnail(`https://cdn.discordapp.com/emojis/${id}.png`)
        .setTimestamp()
        .setFooter('%vur komutu ile düşmana saldır.');// Daha fazla hasar vermek için saldırını emojiler ile desteklendir!');
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