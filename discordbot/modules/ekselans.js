require("../constants.js");
const db = require("../mongodb.js");
const tools = require("../tools.js");
let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
    case 'message': 
        const msg = args.msg;
        
        let uid = tools.is_disboard_bumped(msg);
        if (uid) {
            await db.differ_exp(uid, exps.bump)
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