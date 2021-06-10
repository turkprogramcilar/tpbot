require("./../constants.js");
const db    = require("./../mongodb.js");
const parse = require("./../cmdparser.js");
const fs    = require("fs").promises;

const iconpath = './../icons';

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
                const [m, i, p] = await Promise.all([
                    msg.channel.send("..."),
                    db.get_item(id),
                    fs.read(`${iconpath}/${id}.png`)
                        .catch(async ()=> fs.read(`${iconpath}/undefined.png`))
                        //.catch() buda yoksa coksun bot napalim.
                ]);
                await m.edit(parse.tqs(JSON.stringify(i, null, '\t'),'json'));
            });
        }

        break;
    }
}