// pitmaster channels & roles
rooms = {
    "855529924898979910": { rid: "855530669702643743"},
   // "855529953424965662": { rid: "855530767278014504"},
};
const room_ids = Object.keys(rooms);
const local = cid["loca"]="855529898876993586";
const areas = [...room_ids, local];

const { default: parse } = require("node-html-parser");
const parser = require("../cmdparser.js");
const tools  = require("../tools.js");
const db     = require("../mongodb.js");
const Discord = require("discord.js");

// typescript compiled library
const { cardgame, game_state } = require("../../build/discordbot/cardgame");

// @TODO: move into db? perhaps?
const rarity = {
    1: "Yaygın",
    2: "Güzide",
    3: "Esrarengiz",
    4: "İhtişamlı",
    5: "Destansı",
}
const rarity_colors = {
    1: "586e75",
    2: "839496",
    3: "2aa198",
    4: "b58900",
    5: "cb4b16"
}
const rarity_formats =  {
    1: "brainfuck",
    2: "",
    3: "yaml",
    4: "fix",
    5: "css"
}
const slowmode = 1; //@TODO -> 5

let fetch_start = new Date();
let state = undefined;
// ms: module state
let ms = {
    waiting: {},
    pairing: {},
    games: {},
};
ts_games = {},

exports.init = async (refState) => {
    state = refState;
    fetch_start = new Date();
    try {
        //const json = (await db.get_module_state("pitmaster"));
        //ms = JSON.parse(json);
    } catch {
    } finally {
        fetch_start = undefined;
    }
}
exports.on_event = async (evt, args) => {
    const msg = args.msg;
    switch (evt) {
        case "dm":
            if (parser.is(msg, "kart ")) return await cmd_kart(msg);
            break;

        case "message":

            if (!parser.is(msg, state.prefix)) return;

            if (fetch_start) return await parser.send_uwarn(msg,
                "Modul halen yukleniyor... Lutfen bir sure sonra tekrar deneyin.");

            if (parser.is(msg, "kart ")) return await cmd_kart(msg);

            if (!areas.includes(msg.channel.id)) return;

            if (!parser.cooldown_user(state, msg.author.id, "pitmaster_oyun", slowmode))
                return await parser.send_uwarn(msg, `komut kullanabilmek icin lutfen ${slowmode} saniye bekleyin`);
        
            // oid= other user's id, aid= author's user id
            const aid = msg.author.id;
            const aname = msg.author.username;

            if (msg.channel.id != local) {
                const gid = msg.channel.id;
                const tsg = ts_games[gid];
                const g   = ms.games[gid];
                const p1 = g.p1;
                const p2 = g.p2;
                const ap = tsg.turn == 1 ? p1 : p2;
                const op = tsg.turn == 2 ? p1 : p2;
                const aun = tsg.turn == 1 ? g.un1 : g.un2;
                const oun = tsg.turn == 2 ? g.un1 : g.un2;
                if (parser.is(msg, "oyna ")) return await parser.u_arg(msg, async card => {
                    if ([5,14,16].includes(card) == false) card = 16;
                    if (ap != aid) return await parser.send_uwarn(msg, "Sıra sizde olmadığı için hamle yapamazsınız");
                    const res = tsg.play_card(tsg.turn, card);
                    let header = `\`${aun} aşağıdaki kartı oynadı\``;
                    let embed = await card_embed(card);
                    embed = embed.addField("**-**","**-**");
                    if (!res.OK) return await parser.send_uwarn(msg, res.reason);
                    if (res.flips && res.flips.length>0) 
                        embed = embed.addField(`${aun} oynadığı kart için yazı tura atıyor`, parser.tqs(res.flips.reduce((a,c,i)=>a+=`\n${i+1}. atışı: ${c?"YAZI":"TURA"}`,'')));
                    
                    embed = embed.addField("`Tur sonu oyuncu durumları`", parser.tqs(`${g.un1} can: ${tsg.players[1].health}\n${g.un2} can: ${tsg.players[2].health}`));
                     
                    if (res.state != game_state['unfinished']) {
                        let notice;
                        if (res.state == game_state['win_p1']) notice = `Oyunu ${g.un1} kazandı. Tebrikler`;
                        else if (res.state == game_state['win_p2']) notice = `Oyunu ${g.un2} kazandı. Tebrikler`;
                        else notice = `Oyun berabere bitti.`;
                        embed = embed.addField(`\`${notice}\``, `-`);
                        await finish_game(gid, rooms[gid].rid, [ap, op], msg);
                    }
                    else {
                        tsg.end_round();
                        embed = embed.addField(`-`,`\`${aun} hamlesini tamamladi. Sıra ${oun} oyuncusunda.\``, `-`);
                    }
                    await msg.channel.send({
                        content: header,
                        embeds: [embed]
                    });
                });
            }

            if (parser.is(msg, "kaybet")) {
                // op= other player, ap= author player (msg author), gid= game id (also the room id = channel id)
                const {gid, ap, op} = find_game(aid);
                
                if (gid) {
                    const oname = (await msg.guild.members.fetch(op)).user.username;
                    await finish_game(gid, rooms[gid].rid, [ap, op], msg, `${aname}, rakibi ${oname} karsisinda pes etti.`);
                }
                else {
                    await parser.send_uwarn(msg, "Oyununuz bulunmamaktadir.");
                }
                return;
            } 
            
            if (msg.channel.id != local) return;
            
            if (parser.is(msg, "oyun")) return parser.mention(msg, async oid => {
                if (false && aid==oid) // @TODO
                    return await parser.send_uwarn(msg, "Kendi kendine oyun oynamaya son! Yanlizliga son! Artik bu sunucuda bir cok Turk programci ile arkadas olabilirsin. Onlarla oyun oynamaya ne dersin?");
                
                var {ap, op} = find_pairing(aid);
                if (ap) {
                    const oname = (await msg.guild.members.fetch(op)).user.username;

                    const m = ap == aid
                        ? `${oname}, oyun teklifinizi degerlendirmedi. Baskasi ile yeni oyun baslatmak icin once iptal etmeniz gerekiyor. (%iptal)`
                        : `${oname} tarafindan size gonderilmis olan bir oyun istegi mevcut. Lutfen %kabul edin veya %red komutuyla reddedin.`
                        ;
                    return await parser.send_uwarn(msg, m);
                }
                
                var {gid, ap, op} = find_game(aid);
                if (gid) {
                    const game = ms.games[gid];
                    const oid = op;
                    const oname = (await msg.guild.members.fetch(oid)).user.username;
                    return await parser.send_uwarn(msg, `${oname} oyuncusu ile halen surmekte olan oyununuz mevcut.`);
                }
            
                let m = "";
                ms.pairing[aid]={
                    oid: oid
                }; sync_module();
                m = "Rakibinizin oyun teklifinizi kabul etmesi bekleniyor. (Uyari: Kullanicilari rahatsiz etmek ve gereksiz etiketlemek kurallara aykiridir)";
                return await parser.send_uok(msg, m);
            })

            if (parser.is(msg, "iptal")) {
                if (!ms.pairing[aid]) return await parser.send_uwarn(msg, 
                    "Oyun talebiniz bulunmamaktadir.");
            
                const oname = (await msg.guild.members.fetch(ms.pairing[aid].oid)).user.username;
                delete ms.pairing[aid]; sync_module();
                await parser.send_uok(msg, `${oname} ile olan oyun iptal edildi.`);
            
                return;
            }

            const result = Object.entries(ms.pairing).filter(x=>x[1].oid==aid)[0];
            if (parser.is(msg, "red")) {
                if (!result) await parser.send_uwarn(msg, 
                    "Oyun teklifiniz bulunmamaktadir.");
                else {
                    const oname = (await msg.guild.members.fetch(result[0])).user.username;
                    delete ms.pairing[result[0]]; sync_module();
                    await parser.send_uok(msg, `${oname} teklifi olan olan oyun iptal edildi.`);
                }
            }
            else if (parser.is(msg, "kabul")) {
                if (!result) await parser.send_uwarn(msg, 
                    "Oyun teklifiniz bulunmamaktadir.");
                else {
                    if (!(await try_start_game(result[0], aid, msg))) {
                        ms.waiting[result[0]] = {oid: aid};
                        m = "Rakibiniz ile birlikte uygun masa olunca bilgilendirileceksiniz.";   
                        await parser.send_uwarn(msg, m);   
                    }
                }
            }
        break;
    }
}
const cmd_kart = async (msg) => {
    if (parser.cooldown_user(state, msg.author.id, "pitmaster_kart", slowmode)) parser.u_arg(msg, async id => {
        //hardcoded card limitation: @TODO fix this
        if (id > 0 && id <= 16) {
            const embed = await card_embed(id);
            await msg.channel.send({embeds:[embed]}); 
        }
    });
}
const card_embed = async (id) => {
    const cards = await tools.ensure(state, cardstb, db.get_cards);
    const card  = cards.filter(x=>x.id==id)[0];
    return new Discord.MessageEmbed()
    .setThumbnail(card.link)
    .setTitle(`\`${card.title}\``)
    .setDescription(parser.tqs(`[${card.description}]`, rarity_formats[card.rarity]))
    .addField(`\`Kart cinsi: ${rarity[card.rarity]}\``, `No: ${card.id}\n\n\n`)
    .setColor(rarity_colors[card.rarity]);
}
const find_waiting = (uid) => {
    let ap, op;

    return {ap: ap, op: op};

}
const find_pairing = (uid) => {
    let ap, op;
    if (ms.pairing[uid]) {
        ap = uid;
        op = ms.pairing[ap].oid;
    }
    else {
        const entry = Object.entries(ms.pairing).filter(x=>x[1].oid==uid);
        ap = entry[0], op = entry[1];
    }
    return {ap: ap, op: op}
}
const find_game = (uid) => {
    let gid, ap, op;
    for (const [g, p] of Object.entries(ms.games)) {
        if (p.p1 == uid) {
            gid = g; ap = p.p1; op = p.p2;
            break;
        }
        else if (p.p2 == uid) {
            gid = g; ap = p.p2; op = p.p1;
            break;
        }
    }
    return {gid: gid, ap: ap, op: op};
}
const add_roles = async (rid, ps, guild) => {
    const role = guild.roles.cache.get(rid);
    for (const p of ps) (await guild.members.fetch(p)).roles.add(role);
}
const del_roles = async (rid, ps, guild) => {
    const role = guild.roles.cache.get(rid);
    for (const p of ps) (await guild.members.fetch(p)).roles.remove(role);
}
const try_start_game = async (p1, p2, msg) => {
    const busy = Object.keys(ms.games); 
    const free = room_ids.filter(x => !busy.includes(x));
    if (free.length>0) {
        // give users permissions
        const room = free[0];
        try { 
            await add_roles(rooms[room].rid, [p1, p2], msg.guild);
            ms.games[room] = { p1: p1, p2: p2, guid: msg.guild.id };
            delete ms.pairing[p1];
            // at this point two users should have reacted so their info must
            // be availabe in cache...
            const p1name = msg.guild.members.cache.get(p1).user.username;
            const p2name = msg.guild.members.cache.get(p2).user.username;
            await parser.send_uok(msg, `[${p1name}] vs [${p2name}] ... `+"Oyun basliyor!");
            await init_game(room);
        } catch(err) {
            console.error(err)
            await del_roles(rooms[room].rid, [p1, p2], msg.guild);
        }
        sync_module();
        return true;
    }
    else {
        return false;
    }
}
const get_user = async (guid, pid) => 
    (await (await state.client.guilds.fetch(guid)).members.fetch(pid)).user;
const send_msg = async (guid, gid, content) => {
    const guild = await state.client.guilds.fetch(guid);
    const channel = await guild.channels.cache.get(gid);
    return await parser.send_uok(new Discord.Message(state.client, null, channel), content);
}
const send_dm = async (uid, content) => {
    const user = await state.client.users.fetch(uid);
    await user.send(content);
}

const init_game = async (gid) => {

    const g = ms.games[gid];
    const un1 = (await get_user(g.guid, g.p1)).username;
    const un2 = (await get_user(g.guid, g.p2)).username;
    g.un1 = un1; g.un2 = un2;
    await send_msg(g.guid, gid, "Mucadele basliyor. Round 1 "+`${un1} vs ${un2}`);

    const cardslen = 16; // @TODO hardcoded length
    const first = 5;
    const players = [g.p1, g.p2];
    let promises = [];
    g.players = [];
    for (const p of players) {
        const len = g.players.push({
            pid: p,
            hand: [...Array(first).keys()].map(x=>(Math.random()*cardslen|0)+1)
        });
        //const handp = Promise.all(g.players[len-1].hand.map(async id => await send_dm(p, await card_embed(id))));
        //promises.push(handp);
    }
    await Promise.all(promises);

    ts_games[gid] = new cardgame([16], [16]);
}
const finish_game = async (gid, rid, ps, msg, notice) => {
    
    delete ts_games[gid];
    await del_roles(rid, ps, msg.guild);
    if (notice) await parser.send_uok(msg, notice);
    delete ms.games[gid];
    const first = Object.keys(ms.waiting)[0];
    if (first) {
        if (await try_start_game(first, ms.waiting[first].oid, msg))
            delete ms.waiting[first];
    }
    sync_module();
}
const sync_module = async () => tools.sync_module("pitmaster", ()=>ms, 1);