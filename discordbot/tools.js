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
    if (toggler_timers[k]) {
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