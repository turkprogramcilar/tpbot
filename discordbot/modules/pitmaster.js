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

let fetch_start = new Date();
let state = undefined;
let ms = {
    waiting: {},
    pairing: {},
    games: {},
};
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
    switch (evt) {
        case "message": const msg = args.msg;
            if (!areas.includes(msg.channel.id)) return;
            if (fetch_start) return await parser.send_uwarn(
                "Modul halen yukleniyor... Lutfen bir sure sonra tekrar deneyin.");

            if (!parser.is(msg, state.prefix)) return;

            const slowmode = 1;
            if (!parser.cooldown_user(state, msg.author.id, "pitmaster_oyun", slowmode))
                return await parser.send_uwarn(msg, `komut kullanabilmek icin lutfen ${slowmode} saniye bekleyin`);
        
            // oid= other user's id, aid= author's user id
            const aid = msg.author.id;
            const aname = msg.author.username;
            if (parser.is(msg, "kaybet")) {
                // op= other player, ap= author player (msg author)
                let gid, ap, op;
                for (const [g, p] of Object.entries(ms.games)) {
                    if (p.p1 == aid) {
                        gid = g; ap = p.p1; op = p.p2;
                        break;
                    }
                    else if (p.p2 == aid) {
                        gid = g; ap = p.p2; op = p.p1;
                        break;
                    }
                }
                if (gid) {
                    const oname = (await msg.guild.members.fetch(op)).user.username;
                    await finish_game(gid, rooms[gid].rid, [ap, op], msg, `${aname}, rakibi ${oname} karsisinda pes etti.`);
                }
                else {
                    await parser.send_uwarn(msg, "Oyununuz bulunmamaktadir.");
                }
                return;
            } 
            
            if (msg.channel.id == local) {
                if (parser.is(msg, "oyun")) parser.mention(msg, async oid => {
                    if (false && aid==oid)
                        return await parser.send_uwarn(msg, "Kendi kendine oyun oynamaya son! Yanlizliga son! Artik bu sunucuda bir cok Turk programci ile arkadas olabilirsin. Onlarla oyun oynamaya ne dersin?");
                    const session = ms.pairing[aid];
                    if (session) return await parser.send_uwarn(msg, 
                        `${(await msg.guild.members.fetch(session.oid)).user.username}, oyun teklifinizi degerlendirmedi. Baskasi ile yeni oyun baslatmak icin once iptal etmeniz gerekiyor. (%iptal)`);
                    else {
                        const game = Object.entries(ms.games).filter(x=>x[1].p1==aid||x[1].p2==aid)[0];
                        if (game) {
                            const oid = game[1].p1 == aid ? game[1].p2 : game[1].p1;
                            const oname = (await msg.guild.members.fetch(oid)).user.username;
                            await parser.send_uwarn(msg, `${oname} oyuncusu ile halen surmekte olan oyununuz mevcut.`);
                        }
                        else {
                            let m = "";
                            ms.pairing[aid]={
                                oid: oid
                            }; sync_module();
                            m = "Rakibinizin oyun teklifinizi kabul etmesi bekleniyor. (Uyari: Kullanicilari rahatsiz etmek ve gereksiz etiketlemek kurallara aykiridir)";
                            await parser.send_uok(msg, m);
                        }
                    }
                })
                else if (parser.is(msg, "iptal")) {
                    if (!ms.pairing[aid]) await parser.send_uwarn(msg, 
                        "Oyun talebiniz bulunmamaktadir.");
                    else {
                        const oname = (await msg.guild.members.fetch(ms.pairing[aid].oid)).user.username;
                        delete ms.pairing[aid]; sync_module();
                        await parser.send_uok(msg, `${oname} ile olan oyun iptal edildi.`);
                    }
                }
                else {
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
                } 
                return;
            }

        break;
    }
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
            ms.games[room] = { p1: p1, p2: p2 };
            delete ms.pairing[p1];
            // at this point two users should have reacted so their info must
            // be availabe in cache...
            const p1name = msg.guild.members.cache.get(p1).user.username;
            const p2name = msg.guild.members.cache.get(p2).user.username;
            await parser.send_uok(msg, `[${p1name}] vs [${p2name}] ... `+"Oyun basliyor!");
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
const finish_game = async (gid, rid, ps, msg, notice) => {
    
    await del_roles(rid, ps, msg.guild);
    await parser.send_uok(msg, notice);
    delete ms.games[gid];
    const first = Object.keys(ms.waiting)[0];
    if (first) {
        if (await try_start_game(first, ms.waiting[first].oid, msg))
            delete ms.waiting[first];
    }
    sync_module();
}
const sync_module = async () => tools.sync_module("pitmaster", ()=>ms, 5);