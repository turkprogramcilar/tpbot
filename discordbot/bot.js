require("./constants.js");

const parse   = require("./cmdparser.js");
const status  = require("./marquee_status.js");
const Discord = require('discord.js');

const mpath = "./modules/";

exports.init = (state, token, mods = []) => {
    state = {
        prefix: consts.env.prefix ?? "%",
        ws: {},
    };
    const client  = new Discord.Client();

    let modules = [];

    for (const m of mods) {

        let a = modules.push(require(mpath+m))
        modules[a-1].init(state);
    }
    client.login(token);

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);

        status.init(client, msg_status);
    });

    client.on('messageReactionAdd', async (reaction,user) => {
        for (const m of modules) 
            m.on_event('messageReactionAdd', {reaction: reaction, user: user});
    });
    client.on('message', async msg => {
        if (msg.author == client.user)
            return;

        const content = msg.content;
        for (const m of modules) {
            m.on_event('message', {msg: msg});
            msg.content = content;
        }
            
        // beyond is only commands with prefixes, if not return immediately
        if (!parse.is(msg, state.prefix)) {        
            return;
        }

        // basic commands to test if bot is running
        if (parse.is(msg, "echo ")) {
            if (msg.content.length>0)
                msg.channel.send(msg.content);
            return;
        }
        if (parse.is(msg, "echoq ")) {
            if (msg.content.length>0)
                msg.channel.send(parse.tqs(msg.content));
            return;
        }

        // beyond is administrative or feature previews only, 
        // if not admin return
        if (uid_admins.includes(msg.author.id) == false)
            return;

        if (parse.is(msg, "test")) {
            
            const embed = new Discord.MessageEmbed()
            .setColor('#F80000')
            .setAuthor('auth 1name', 'https://cdn.discordapp.com/embed/avatars/1.png')
            .setAuthor('auth2 name', 'https://cdn.discordapp.com/embed/avatars/5.png')
            .addField('`Birinci`', 'test', true)
            .addField('', '```diff\n+ Birinci```', true)
            .addField('4', 'test', true)
            .setTimestamp()
            .setFooter('%vur komutu ile düşmana saldır.');// Daha fazla hasar vermek için saldırını emojiler ile desteklendir!');
                msg.channel.send(embed)
            return
        }

        // beyond is admin + fix prefix,
        if (!parse.is(msg, "fix"))
            return;

        // syncs channel permssions with categories belonging caid_fix in constants
        if (parse.is(msg, "sync")) {
            // print all categories
            msg.guild.channels.cache.each(x=>{
                if (x.type == "text" && x.parent) {
                    x.lockPermissions()
                        .then(() => console.log('Successfully synchronized permissions with parent channel'+`${x.parent.name}->${x.name}`))
                        .catch(console.error);
                }
            });
        }
    });
}

module.exports.set_sendallF = (f) => {
    state.ws.send_all = f;
}
