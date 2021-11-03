require("./constants.js");

const db      = require("./mongodb.js");
const fs      = require("fs").promises;
const php     = require("./php.js");
const tools   = require("./tools.js");
const parser  = require("./cmdparser.js");

const Discord = require('discord.js');
const htmlp   = require('node-html-parser');

const mpath = "./modules/";
const ts_mpath = "../build/discordbot/modules/"
const maints = "main";

exports.init = async (state, token, mods = [], ws_f = ()=>{}) => {
    
    const client  = new Discord.Client({ intents: [32767] });
    state = {
        client: client,
        prefix: consts.env.prefix ?? "%",
        ws: {
            send_all: ws_f
        },
        cooldown: {
            global: {},
            users: {},
        },
        cache: {
            module: {

            },
            table: {

            }
        },
    };

    let modules = [];
    let all_command_ids = [];
    const promises = [];
    for (const m of mods) {

        let path = null;
        let cloned_state = {...state};

        // is this a legacy js module?
        if (await tools.fs_exists("discordbot/"+ mpath+m+".js")) {
            path = mpath+m;
        }

        // is this a legacy ts module?
        else if (await tools.fs_exists("discordbot/"+ ts_mpath+m+".js")) {
            path = ts_mpath+m;
        }

        // is this a modern ts folder module?
        else if (await tools.fs_exists("discordbot/"+ ts_mpath+m)) {

            if (await tools.fs_exists("discordbot/"+ ts_mpath+m+"/"+maints+".js")) {
                path = ts_mpath+m+"/"+maints;
                cloned_state.command_support = true;
                cloned_state.modern_boilerplate = true;
            }
            else {
                console.error("a modern ts module folder called "+m+" without "+maints+" cannot be loaded.");
                continue;
            }
        }

        if (!path) {
            console.error("module not found: "+m);
            process.exit(1);
        }
        
        const loaded = cloned_state.modern_boilerplate == true 
            ? require(path).m
            : require(path)
            ;
        if (!loaded.init)
            throw Error("Module has no init method defined at " +path);

        modules.push(loaded);
        promises.push(loaded.init(cloned_state));
    }
    client.login(token);

    client.on('ready', async () => {

        all_commands = [];
        modern_modules = [];
        for (const m of modules) {

            m.on_event('ready', {});

            if (m.get_commands !== undefined) {
                
                all_commands.push(m.get_commands());
                modern_modules.push(m);
            }
        }

        // load empty modern module for static function calls
        const modern = require("../build/discordbot/modern.js");
        const name_id_pairs = await modern.modern.register_commands(all_commands, client);

        // broadcast all loaded command id's from discord server
        for (const m of modern_modules)
            m.set_command_ids(name_id_pairs);

        all_command_ids = name_id_pairs.map(x => x[1]);
        all_command_names = name_id_pairs.map(x => x[0])
        
        const cmds = modern_modules.map(x => x.module_name);
        console.log(`Logged in as ${client.user.tag}! (for modules=[${mods}], commands=[${all_command_names}]`);
        
        // load status switcher module
        require("./marquee_status.js").init(client, msg_status);
    });

    for (const evt of ['presenceUpdate']) {
            
        client.on(evt, async (a1,a2) => {
            for (const m of modules) 
                m.on_event(evt, [a1, a2]);
        }); 
    }
    client.on('interactionCreate', async interaction => {
        
        if (interaction.isCommand() && false == all_command_ids.includes(interaction.commandId)) {
            console.warn(`command id[${interaction.id}] is not found in commands when first executing command [user=${interaction.user.username},id=${interaction.user.id}]`);
            return;
        }
        
        for (const m of modules) 
            m.on_event('interactionCreate', {interaction: interaction});
    });
    client.on('messageReactionRemove', async (reaction,user) => {
        for (const m of modules) 
            m.on_event('messageReactionRemove', {reaction: reaction, user: user});
    });
    client.on('messageReactionAdd', async (reaction,user) => {
        for (const m of modules) 
            m.on_event('messageReactionAdd', {reaction: reaction, user: user});
    });
    client.on('messageCreate', async msg => {
        if (msg.author == client.user)
            return;

        const content = msg.content;
        const evt = msg.channel.type == 'dm' ? 'dm' : 'message';
        for (const m of modules) {
            m.on_event(evt, {msg: msg});
            msg.content = content;
        }

        if (msg.author.bot || msg.member?.roles.cache.map(x=>x.id).includes(rid.botlar))
            return;
            
        // beyond is only commands with prefixes, if not return immediately
        if (!parser.is(msg, state.prefix)) {        
            return;
        }
        // beyond is administrative or feature previews only, 
        // if not admin return
        if (groups.admins.includes(msg.author.id) == false)
            return;

        if (parser.is(msg, "echo ")) {
            if (msg.content.length>0)
                msg.channel.send(msg.content);
            return;
        }
        else if (parser.is(msg, "echoq ")) {
            if (msg.content.length>0)
                msg.channel.send(parser.tqs(msg.content));
            return;
        }
        else if (parser.is(msg, "collect")) {
            const guilds = await client.guilds.cache;
            list = []
            for (const [str, guild] of guilds) {
                list.push(parser.tqs(`name: ${guild.name} id: ${guild.id}\n`));
                
            }
            await msg.channel.send(list.reduce((a,c)=>a+=c));
            state.goingleave = []
            list = []
            for (const [str, guild] of guilds) {
                if (guild.id != "698972054740795453") {
                    list.push(parser.tqs(`name: ${guild.name} id: ${guild.id}\n`));
                    state.goingleave.push(guild.id);
                }
            }
            await msg.channel.send(state.goingleave.reduce((a,c)=>a+=c+"\n", "Going to leave:\n"));
            return;
        }
        else if (parser.is(msg, "leave")) {
            if (!state.goingleave) return;
            for (const id of state.goingleave) {
                await msg.channel.send(`Leaving: ${id}`);
                await (await client.guilds.fetch(id)).leave();
            }
        }
        else if (parser.is(msg, "test_getmsg")) {
            const msgs = await msg.channel.messages.fetch();
            await fs.writeFile("./out.txt", JSON.stringify(msgs.reduce((a,c)=>[c.content,...a],[])));
        }
        else if (parser.is(msg, "test_convert")) {
            for (const field of [
                'Kind', 'Slot', 'Race', 'Class', 'Damage', 'Delay', 'Range', 'Weight', 'Duration', 'BuyPrice', 'SellPrice', 'Ac', 'Countable', 'Effect1', 'Effect2', 'ReqLevel', 'ReqLevelMax', 'ReqRank', 'ReqTitle', 'ReqStr', 'ReqSta', 'ReqDex'
            ])
                await db.convert_field_str_to_int(itemstb, field);
        }
        else if (parser.is(msg, "testexpall")) {
            
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
        }            
        else if (parser.is(msg, "version")) {
            const sha1=consts.env.version;
            if (!sha1) {
                await parser.send_awarn(msg, "commit sha1 for version is undefined");
                return;
            }
            const url = `https://github.com/turkprogramcilar/turk-programcilar-bot/commit/${sha1}`;
            const res = await tools.https_get(url);
            const r = res.match(/relative-time\s+datetime\=\"(.*?)\"/);
            if (!r || r.length < 1) {
                await parser.send_awarn(msg, "regex didn't match the get response body");
                return;
            }

            const desc = htmlp.parse(res)
                .querySelector('.commit-title.markdown-title')
                .textContent.trim();
            
            await msg.channel.send({embeds:[new Discord.MessageEmbed()
                .setDescription(parser.tqs(desc))
                .setAuthor("Türk Programcılar", client.guilds.cache.get(sid.tpdc).iconURL(), url)
                .addField("`commit date`", parser.tqs(new Date(r[1])))
                .addField(`\`commit sha1\``, parser.tqs(`${sha1}`))
                .setThumbnail(client.user.avatarURL())]}
            );
            return;
        }
        else if (parser.is(msg, "install")) {
            const res_arr = await db.install_db();
            msg.channel.send(parser.json_pretty(res_arr));
            return;
        }
        // syncs channel permssions for all channels
        else if (parser.is(msg, "sync")) {
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

    await Promise.all(promises);
}