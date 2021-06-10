require("./constants.js");

const db      = require("./mongodb.js");
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
        console.log(`Logged in as ${client.user.tag}! (for modules=[${mods}])`);

        status.init(client, msg_status);
    });

    client.on('messageReactionAdd', async (reaction,user) => {
        for (const m of modules) 
            m.on_event('messageReactionAdd', {reaction: reaction, user: user});
    });
    client.on('message', async msg => {
        if (msg.author == client.user || msg.author.bot || msg.member.roles.cache.map(x=>x.id).includes(rid.botlar))
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
        if (groups.admins.includes(msg.author.id) == false)
            return;

        if (parse.is(msg, "test ")) {
            const sent = await msg.channel.send("...");
            const exp  = await db.get_exp(msg.content);
            await sent.edit(exp);
        }
        /*else if (parse.is(msg, "testexpall")) {
            
            const Guild = msg.guild;
            const Members = Guild.members.cache.map(member => member.id); // Getting the members and mapping them by ID.
            exps = [];
            const process_text = "Bu biraz zaman alacak... ";
            const process_msg = msg.channel.send(process_text);
            let i = 0;
            const members = await msg.guild.members.fetch(); 
            const mn = members.array().length;
            for (const member of members) {
                if (i % 50 == 0) (await process_msg).edit(process_text+`${i}\\${mn}`);
                i++;
                exps.push({id: member[0], exp: await php.get_exp(member[0])});
            }
            msg.channel.send({
                files: [{
                    attachment: Buffer.from(JSON.stringify(exps)),
                    name: "result.txt"
                }]
            });
            (await process_msg).edit("Tamamlandi... Mesaj linki (kim ugrascak yapmaya atti iste asagida).");
            return
        }*/
        // beyond is admin + fix prefix,
        if (!parse.is(msg, "fix"))
            return;

        if (parse.is(msg, "items")) {
            db.install_items();
            return;
        }

        // syncs channel permssions for all channels
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
