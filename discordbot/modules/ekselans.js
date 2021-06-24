require("../constants.js");
const db = require("../mongodb.js");
const tools = require("../tools.js");
const Discord   = require('discord.js');
const parser = require("./../cmdparser.js");
let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
    case 'message': 
        const msg = args.msg;
        
        let uid = tools.is_disboard_bumped(msg);
        if (uid) {
            const client = state.client;
            const p0 = db.differ_exp(uid, exps.bump);
            const rid = await tools.get_riid(state);
            const p1 = db.give_item(uid, rid);
            const p2 = msg.channel.send(new Discord.MessageEmbed()
                .setDescription(parser.tqs("Afferin evlat. Seni aşağıdaki ödüllerle kutsuyorum"))
                .setAuthor(msg.author.username, msg.author.avatarURL())
                .addField("`Deneyim puanı (exp)`", parser.tqs(exps.bump))
                .setThumbnail(client.user.avatarURL())
            );
            await Promise.all([p0, p1, p2]);
            await tools.send_embed_item(msg, rid, state);
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