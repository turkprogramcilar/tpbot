require("./../constants.js");
const parser = require("./../cmdparser.js");

let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
        case "message": const msg = args.msg;

        if (msg.channel.id == cid.botkomutlari
            && parser.is("kp")) {
            if 
        }

        break;
    }
}