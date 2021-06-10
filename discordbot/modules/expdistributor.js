require("./../constants.js");
const db = require("./../mongodb.js");
let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
    case 'message': 
        const msg = args.msg;
        
        if (msg.author.id == uid.disboard 
            && msg.channel.id == cid.bumperado
            && msg.embeds?.length > 0
            && msg.embeds[0].image) {
            const r = msg.embeds[0].description?.match(/^<@!?([0-9]+)>/);
            if (r) await db.differ_exp(r[1], exps.bump);
        }
        else if (Object.keys(exps_by_channel).includes(msg.channel.id)) {
            //console.log(`${msg.author.username}: +${exps_by_channel[msg.channel.id]} (on=${msg.channel.name})`);
            await db.differ_exp(msg.author.id, exps_by_channel[msg.channel.id]);
        }
        else if (Object.keys(exps_by_category).includes(msg.channel.parentID)) {
            await db.differ_exp(msg.author.id, exps_by_category[msg.channel.parentID]);
            //console.log(`${msg.author.username}: +${exps_by_category[msg.channel.parentID]} (on=${msg.channel.name})`);
        }
        else {
            //console.log(`${msg.author.username}: +(default) (on=${msg.channel.name})`);
            await db.differ_exp(msg.author.id, exps.default);
        }
        break;
    }
}