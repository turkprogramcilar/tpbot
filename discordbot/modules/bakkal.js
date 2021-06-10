require("./../constants.js");
const db    = require("./../mongodb.js");
const parse = require("./../cmdparser.js");
const fs    = require("fs").promises;

const Discord = require('discord.js');

const iconpath = './discordbot/icons';

let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
        case "message": const msg = args.msg;

        if (!parse.is(msg, state.prefix))
            return;

        if (msg.channel.id == cid.botkomutlari
            && parse.is(msg, "bk ")) {
            // id ile item bilgisi sorgulama
            parse.i_arg(msg, async id => {
                const [i, p] = await Promise.all([
                    db.get_item(id),
                    fs.readFile(`${iconpath}/${id}.png`)
                        .catch(async ()=> fs.readFile(`${iconpath}/undefined.png`))
                        //.catch() buda yoksa coksun bot napalim.
                ]);
                
                const title = (i?.strName??"Item not found");
                const price = i?.BuyPrice??0;
                let embedded = new Discord.MessageEmbed()
                    //.setTitle(i?.strName??"Item not found")
                    .setThumbnail(`attachment://icon.png`);
                if (i?.strDesc) embedded = embedded.addField('`'+title+'`', parse.tqs(i.strDesc))
                if (i) {
                    delete i["_id"]; delete i["id"];
                    delete i["strName"]; delete i["strDesc"];
                    delete i["IconID"]; delete i["BuyPrice"];
                    for (const k of Object.keys(i)) {
                        if (!i[k] || i[k].toString()=='0')
                            delete i[k];
                    }
                }
                
                await msg.channel.send({
                    files: [{
                        attachment: p,
                        name:'icon.png'
                    }],
                    embed: embedded
                        .addField(`Buy price: ${price}`, parse.tqs(JSON.stringify(i??{},null,'\t'),'json'))
                });
            });
        }

        break;
    }
}