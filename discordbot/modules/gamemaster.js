const parse = require("./../cmdparser.js");
const php   = require("./../php.js");

state = undefined;

exports.init = (refState) => state = refState;
exports.on_message = async (msg) => {
    
    if (parse.is(msg, "arena")) {
        state.arena_toggle = !state.arena_toggle;
        msg.channel.send(`Arenaya atilan tum mesajlari sil: ${state.arena_toggle}`);
    }
    else if (parse.set_arg(msg, "buff",    f => state.arena.buff = f,       "Arena hasar oranını düzenle"));
    else if (parse.set_arg(msg, "sans",    f => state.arena.spawn_rate = f, "Arena emoji çıkma şansını düzenle"));
    else if (parse.set_arg(msg, "frekans", f => state.arena.frequency = f,  "Arena güncelleme sıklığı (sn)"));
    else if (parse.set_arg(msg, "vur",     f => state.arena.hit(Discord, msg, true, f)));
    else if (parse.is(msg, "yarat ")) {
        r = msg.content.match(/^<:([A-z]+):([0-9]+)>\s*([0-9]+)/)
        if (r) {
            id=r[2]; nm=r[1]; hp=parseInt(r[3]);
            if (!msg.guild.emojis.cache.get(id)) return;
            state.arena.create(Discord, msg, nm, id, hp)
        }
    }
    /*else if (parse.is(msg, test)) {
        const embed = new Discord.MessageEmbed()
        .setColor('#F80000')
        .setTitle(title(name, hp,mhp))
        .setDescription(`Can: ${hp}/${mhp}`)
        .addField('Birinci', 'test', true)
        .addField('Birinci', 'test', true)
        .addField('Birinci', 'test', true)
        .addField('Birinci', 'test', true)
        .addField('Birinci', 'test', true)
        .addField('Birinci', 'test', true)
        .setThumbnail(`https://cdn.discordapp.com/emojis/${id}.png`)
        .setTimestamp()
        .setFooter('%vur komutu ile düşmana saldır.');// Daha fazla hasar vermek için saldırını emojiler ile desteklendir!');
        msg.channel.send(embed)
    }*/
    else if (parse.is(msg, "dmg ")) r_arg(msg, /^[0-9]+/, async n => {
        xp = await php.get_exp(n);
        msg.channel.send(`Exp: ${xp} | Dmg: ${state.arena.dmg(xp)}`);
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
}