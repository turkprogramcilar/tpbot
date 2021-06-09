require("./../constants.js");
let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
    case 'message': 
        const msg = args.msg;
        
        if (Object.keys(exps_by_channel).includes(msg.channel.id)) {

        }
        else if (Object.keys(exps_by_category).includes(msg.channel.category.id)) {

        }
        else {

        }
        break;
    }
}