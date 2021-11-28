exports.is = (msg, cmd) => {
    if (msg.content.trimStart().toLowerCase().startsWith(cmd.toLowerCase())) {
        msg.content = msg.content.trimStart().slice(cmd.length);
        return true;
    }
    return false;
}
exports.regex_arg = async (msg, f, f_else, fr, regex, ri=0) => {
    r = msg.content.trimStart().match(regex); if (r) {
        msg.content = msg.content.trimStart().slice(r[0].length);
        await f(fr.call(null, r[ri]));
        return true;
    } else {
        await f_else();
        return false;
    }
}
exports.json_pretty = (str) => exports.tqs(JSON.stringify(str,null,'\t'), 'json');
// wrap with triple quote
exports.tq =  (str,format='') => { return '```'+format+'\n'+str+'```'; }
// wrap with triple quote + safe (2000 char limit)
exports.tqs = (str,format='') => { return exports.tq((str?.toString() ?? "").substr(0,2000-1-6-format.length-1),format); }
// async operations
exports.send_awarn = async (msg, str) => await send_tqs_custom(msg, str, "fix", "warning");
exports.send_uwarn = async (msg, str, reply=false) => await send_tqs_custom(msg, str, "diff", "! uyarı", reply);
exports.send_uok   = async (msg, str, reply=false) => await send_tqs_custom(msg, str, "brainfuck", "# bilgi", reply);
exports.send_custom= async (msg, str, format, reply=false, title="") => await send_tqs_custom(msg, str, format, title, reply);
const send_tqs_custom = async (msg, str, format, title, reply=false) => {
    sendmsg = exports.tqs((title == '' ? "" : title+": ")+str,format);
    if (reply)
        return await msg.reply(sendmsg);
    else
        return await msg.channel.send(sendmsg);
}
// async operations' raw text
const get_tqs_custom = (str, format, title) => {
    sendmsg = exports.tqs((title == '' ? "" : title+": ")+str,format);
    return sendmsg;
}
exports.get_awarn = (str) => get_tqs_custom(str, "fix", "warning");
exports.get_uwarn = (str) => get_tqs_custom(str, "diff", "! uyarı");
exports.get_uok   = (str) => get_tqs_custom(str, "bash", "# bilgi");
exports.get_custom= (str, format, title="") => get_tqs_custom(str, format, title);


exports.mention = async (msg, f, fe=()=>{}) => { await exports.regex_arg(msg, f, fe, x=>x, /^<@!?([0-9]+)>/, 1); }
exports.mention_else_self = async (msg, f) => { await exports.mention(msg, f, ()=>f(msg.author.id))}
exports.r_arg = async (msg, regex, f, fe=()=>{}) => { return await exports.regex_arg(msg, f, fe, x=>x, regex); }
exports.u_arg = async (msg, f, fe=()=>{}) => { return await exports.regex_arg(msg, f, fe, parseInt, /^[0-9]+/); }
exports.i_arg = async (msg, f, fe=()=>{}) => { return await exports.regex_arg(msg, f, fe, parseInt, /^[+-]?[0-9]+/); }
exports.f_arg = async (msg, f, fe=()=>{}) => { return await exports.regex_arg(msg, f, fe, parseFloat, /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/); }

exports.set_arg = (msg, cmd, setF, channel_msg=null) => {
    if (exports.is(msg, cmd)) { 
        exports.f_arg(msg, f => {
            setF(f);
            if (channel_msg) msg.channel.send(`${channel_msg}: ${f}`);
        })
        return true;
    } else {
        return false;
    }
}
exports.cooldown_global_debug_print = (state, key, cds) => {
    const msS = 1000; const now = new Date();
    const b4r = state.cooldown.global[key];
    const ret = undefined==b4r || new Date(b4r.getTime()+cds*msS) <= now;
    console.log({"b4r": b4r, "now": now, "diff": new Date(b4r.getTime()+cds*msS).getSeconds(), "ret": ret});
}
const cooldown = (state, key, get, set, cds, fdo, felse) => {
    const msS = 1000; const now = new Date();
    const b4r = get();
    const ret = undefined==b4r || new Date(b4r.getTime()+cds*msS) <= now;
    if (ret) {
        set(now);
        fdo(state, key, cds);
    }
    else felse(state, key, cds);
    return ret;
}
exports.cooldown_global = (state, key, cds=5, fdo=()=>{}, felse=()=>{}) =>
    cooldown(state, key, ()=>state.cooldown.global[state], s=>state.cooldown.global[state]=s, cds, fdo, felse);
exports.cooldown_user = (state, id, key, cds=5, fdo=()=>{}, felse=()=>{}) => {
    if (!state.cooldown.users[id]) state.cooldown.users[id]={};
    return cooldown(state, key, ()=>state.cooldown.users[id][key], s=>state.cooldown.users[id][key]=s, cds, fdo, felse);
}