
state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, msg) => {
    msg = msg.msg;
    if (evt != 'message' || !msg) return;
    if (msg.channel.id == cid.wschannel) {
        
        if (msg.content.length <= 0) 
            return;

        let guild = msg.guild;
        let member = guild.member(msg.author);
        let nickname = member ? member.displayName : msg.author.username;
        sendmsg = `${nickname}: ${msg.content}`;
        console.log(sendmsg);
        state.ws.send_all(sendmsg);

        //handled channel, return
        return;
    }
}