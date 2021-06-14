require("./constants.js")
const https = require('https');
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