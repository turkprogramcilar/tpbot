require("./constants.js")
const parser = require("./cmdparser.js");

const https   = require('https');
const Discord = require('discord.js');

exports.https_get = async url => new Promise(resolve => {
    https.get(new URL(url), async res => {
        try {
            let body = '';
            res.setEncoding('utf-8');
            for await (const chunk of res) {
                body += chunk;
            }
            resolve(body);
        } catch (e) {
            console.log('ERROR', e);
        }
    });
});
// input: h,s,v in [0,1] - output: r,g,b in [0,1]
exports.hsv2rgb = (h,s,v) => { 
    
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };  
}
exports.hsv2rgbh = (h,s,v) => {
    a = exports.hsv2rgb(h,s,v);
    return   (a.r).toString(16).padStart(2,'0')
            +(a.g).toString(16).padStart(2,'0')
            +(a.b).toString(16).padStart(2,'0');
}

let toggler_states = {}
let toggler_timers = {}
exports.toggler = (f, k, fq) => {
    if (!toggler_timers[k]) {
        f();
        toggler_states[k] = false;
        toggler_timers[k] = setTimeout(() => {
            toggler_timers[k] = null;
            if (toggler_states[k]) exports.toggler(f, k, fq);
        }, fq);
    } else {
        toggler_states[k] = true;
    }
}
let togglera_states = {}
let togglera_timers = {}
exports.toggler_async = async (f, k, fq) => {
    if (!togglera_timers[k]) {
        await f();
        togglera_states[k] = false;
        togglera_timers[k] = setTimeout(async () => {
            togglera_timers[k] = null;
            if (togglera_states[k]) await exports.toggler_async(f, k, fq);
        }, fq);
    } else {
        togglera_states[k] = true;
    }
}


const fs  = require("fs").promises;
const fsC = require("fs")
const db  = require("./mongodb.js");

exports.fs_exists = async file =>
    fs.access(file, fsC.constants.F_OK)
        .then(() => true)
        .catch(() => false)

exports.guard_iconpath = async (id) =>
    (await exports.fs_exists(`${iconpath}/${id}.png`))
     ? `${iconpath}/${id}.png`
     : `${iconpath}/undefined.png`
     ;
exports.read_icon = async (id) => 
    await fs.readFile(`${iconpath}/${id}.png`)
        .catch(async ()=> fs.readFile(`${iconpath}/undefined.png`))
        //.catch() buda yoksa coksun bot napalim.


exports.ensure = async (state, tb, cachef) => {
    if (!state.cache.table[tb]) state.cache.table[tb] = await cachef();
    return state.cache.table[tb];
}
// get random item id
exports.get_riid = async (state) => {
    const items = await exports.ensure(state, itemstb, db.get_items);
    const rid = (i=>i[Math.floor(Math.random()*i.length)])(items.map(x=>x["Num"]));
    return rid;
}

exports.sync_module = (module, json_get, frequency) => {
    exports.toggler_async(async () => db.set_module_state(module, JSON.stringify(json_get())), "sync_module_"+module, frequency*1000);
}


// calculate exp dependent damage

// Anlik sunucuda en fazla exp 148k, yaklasik 0.6~ + 1 -> 1.6 kat fazla
// damage veriyor bu formul
exports.getexpm = (xp) => 1 + Math.log(1*xp/200000+1);
exports.base_dmg = (idmg, expm) => (100 + idmg)*expm;
exports.damage_multiplier = (time_diff) => 1/(1+Math.pow(1.3,(-time_diff+20)))+1/(1+Math.pow(5,-(time_diff) + 2)); 


exports.final_dmg = (base_dmg, time_diff) => base_dmg*exports.damage_multiplier(time_diff);
///

// platform specific tools:
exports.is_disboard_bumped = (msg) => {
    if (msg.author.id == uid.disboard 
        && msg.channel.id == cid.bumperado
        && msg.embeds?.length > 0
        && msg.embeds[0].image) {
        const r = msg.embeds[0].description?.match(/^<@!?([0-9]+)>/);
        if (r) return r[1];
        else undefined;
    }
}

//embeds:
exports.send_embed_item = async (msg, id, state) => {
    const plus = exports.iplus(id);
    const fullid = id;
    id = exports.i0(id);
    const [is, p] = await Promise.all([
        exports.ensure(state, itemstb, db.get_items),
        exports.read_icon(id)
    ]);
    let i = is.find(x=>x["Num"]==id);
    if (i) i = JSON.parse(JSON.stringify(i));
    const title = (i?.strName??"Item not found").replace(/\(\+[0-9]+\)/, '').trim()+(plus>0?` (+${plus})`:"");
    const price = i?.BuyPrice??0;
    const num   = i?.Num;
    let embedded = new Discord.MessageEmbed()
        .setThumbnail(`attachment://icon.png`)
        .setFooter(`\`${num}\``)
        ;
        //.addField('`'+title+'`', (i?.strDesc) ? parser.tqs(i.strDesc) : "-");
        
    // cleanup values with 0 and already shown values
    if (i) {
        delete i["_id"];     delete i["Num"];
        delete i["strName"]; //delete i["strDesc"];
        //delete i["IconID"];  //delete i["BuyPrice"];
        for (const k of Object.keys(i)) {
            if (plus && plus > 0)
                i[k] = exports.iplus_stat(fullid, i[k]);
            if (!i[k] || i[k].toString()=='0') if (k!='Slot')
                delete i[k];
        }
    }
    
    await msg.channel.send({
        files: [{
            attachment: p,
            name:'icon.png'
        }],
        embed: embedded
            .addField('`'+title+'`', parser.tqs(JSON.stringify(i??{},null,'\t'),'json'))
    });
};
exports.ac_reduces_dmg = (ac, dmg) => {
    if (dmg <= 0) return 0;
    if (ac  <= 0) return 3;
    const x = ac/dmg;
    //http://fooplot.com/#W3sidHlwZSI6MCwiZXEiOiIxLygoeCozNis3KS8yMSkiLCJjb2xvciI6IiMwMDAwMDAifSx7InR5cGUiOjMsImVxIjpbWyIwIiwiMyJdLFsiMSIsIjAuNSJdLFsiMiIsIjAuMjUiXSxbIjMiLCIwLjE2NiJdXSwiY29sb3IiOiIjMDAwMDAwIn0seyJ0eXBlIjoxMDAwLCJ3aW5kb3ciOlsiLTAuOTgwMDYxNTM4NDYxNTM4MyIsIjMuNTE5OTM4NDYxNTM4NDYwNiIsIi0xLjQwMDk0OTk5OTk5OTk5OTUiLCIzLjA5OTA0OTk5OTk5OTk5OTYiXX1d
    return 1/((x*36+7)/21);
}
exports.i0 = (iid) => iid.toString().length == 9 ? iid/10|0 : iid;
exports.iplus = (iid) => iid.toString().length != 9 ? 0 : parseInt(iid.toString()[8]);
exports.iplus_stat = (iid, stat) => stat * Math.pow(1.11, exports.iplus(iid)) | 0;