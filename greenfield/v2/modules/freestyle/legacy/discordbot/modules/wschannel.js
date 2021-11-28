
state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, msg) => {
    msg = msg.msg;
    if (evt != 'message' || !msg) return;
    if (msg.channel.id == cid.wschannel) {
        
        if (msg.content.length <= 0) 
            return;

        let nickname = msg.member.nickname;
        sendmsg = `${nickname}: ${msg.content}`;
        console.log(sendmsg);
        state.ws.send_all(sendmsg);

        //handled channel, return
        return;
    }
}