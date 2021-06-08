let state = undefined;
exports.init = (refState) => state = refState;
exports.on_event = async (evt, args) => {
    switch (evt) {
    case 'message':
        const msg = args.msg;

        if (msg.content == e) {
            sendAtaturk(msg.channel);
            return;
        }
        break;

    case 'messageReactionAdd':
        const reaction = args.reaction;
        const user = args.user;

        if (reaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        if (reaction.emoji.name == e && 
            reaction.message.reactions.cache.has(e) &&
            reaction.message.reactions.cache.get(e).count == 1) {
                sendAtaturk(reaction.message.channel);
        }
        break;
    }
}
const e = '🤌';
function sendAtaturk(channel) {
    return channel
        .send("https://cdn.discordapp.com/attachments/824578307722575892/828715024641163264/ataturk.png")
        .then(x=>x.delete({timeout: 8000}));
}