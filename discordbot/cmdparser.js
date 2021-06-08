exports.is = (msg, cmd) => {
    if (msg.content.trimStart().startsWith(cmd)) {
        msg.content = msg.content.trimStart().slice(cmd.length);
        return true;
    }
    return false;
}
exports.regex_arg = (msg, f, f_else, fr, regex) => {
    r = msg.content.trimStart().match(regex); if (r) {
        msg.content = msg.content.trimStart().slice(r[0].length);
        f(fr.call(null, r[0]));
    } else {
        f_else();
    }
}
// wrap with triple quote
exports.tq =  (str) => { return '```'+str+'```'; }
// wrap with triple quote + safe (2000 char limit)
exports.tqs = (str) => { return exports.tq(str.substr(0,2000-1-6)); }

exports.r_arg = (msg, regex, f, fe=()=>{}) => { exports.regex_arg(msg, f, fe, x=>x, regex); }
exports.u_arg = (msg, f, fe=()=>{}) => { exports.regex_arg(msg, f, fe, parseInt, /^[0-9]+/); }
exports.i_arg = (msg, f, fe=()=>{}) => { exports.regex_arg(msg, f, fe, parseInt, /^[+-][0-9]+?/); }
exports.f_arg = (msg, f, fe=()=>{}) => { exports.regex_arg(msg, f, fe, parseFloat, /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/); }

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