require("./../constants.js");
const db    = require("./../mongodb.js");
const parse = require("./../cmdparser.js");

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
                const [m, i] = await Promise.all([
                    msg.channel.send("..."),
                    db.get_item(id)
                ]);
                console.log("OK");
                await m.edit(parse.tqs(JSON.stringify(i)));
            });
        }

        break;
    }
}