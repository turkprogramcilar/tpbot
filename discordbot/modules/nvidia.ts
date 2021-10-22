// package imports
import { Message, Client, Channel } from "discord.js";
// local imports
const constants = require("../../../discordbot/constants");
const parser    = require("../../../discordbot/cmdparser");
const db        = require("../../../discordbot/mongodb");
const tools     = require("../../../discordbot/tools");

const nvidia_link : string = "https://tenor.com/view/linus-linus-torvalds-nvidia-fuck-you-gif-18053606";
const nvidia = [
    '🇳',
    '🇻',
    '🇮',
    '🇩',
    '858621266944852008',
    '🇦'
];

const left_diff = <T> (a1: T[], b1: T[]) : T[] => ((f : any) => f(a1,b1))((a: any, b: any)=>[...new Set(a)].filter(x => !(new Set(b)).has(x)));

// @TODO might be improved with .includes()
const diff = <T> (a1: T[], b1: T[]) : T[] => ((f : any) => [...f(a1,b1),...f(b1,a1)])((a: any, b: any)=>[...new Set(a)].filter(x => !(new Set(b)).has(x)));
// unicode emoji alphabet to ascii alphabet
const utoa = { "🇿": "z", "🇾": "y", "🇽": "x", "🇼": "w", "🇻": "v", "🇺": "u", "🇹": "t", "🇸": "s", "🇷": "r", "🇶": "q", "🇵": "p", "🇴": "o", "🇳": "n", "🇲": "m", "🇱": "l", "🇰": "k", "🇯": "j", "🇮": "ı", "🇭": "h", "🇬": "g", "🇫": "f", "🇪": "e", "🇩": "d", "🇨": "c", "🇧": "b", "🇦": "a", "ℹ️": "i"};

const module_name = "nvidia";
const sync_module = async () => tools.sync_module(module_name, ()=>state.cache.module[module_name], 1);
let fetch_start : Date | undefined;
let state: any;
export const init = async (refState: any) => {
    state = refState;
    const client : Client = state.client;
    fetch_start = new Date();
    try {
        const json = (await db.get_module_state(module_name));
        state.cache.module[module_name] = JSON.parse(json);
    } catch {
        state.cache.module[module_name] = {
            nvidias: [],
        };
    } finally {
        fetch_start = undefined;
    }
    
    const channel = await client.channels.fetch(constants.cid.printfscanf);
    if (channel?.isText() && state.cache.module[module_name].nvidias.length > 0) {
        await Promise.all(state.cache.module[module_name].nvidias.map((mid: string) => channel.messages.fetch(mid)));
    }
}

/**
 * 
    if (fetch_start) return await parser.send_uwarn(msg,
        "Modul halen yukleniyor... Lutfen bir sure sonra tekrar deneyin.");
 */
export const on_event = async (evt: string, args: any) => {

    switch(evt) {
        case 'message': const msg : Message = args.msg;
            if (msg.channel.id == constants.cid.printfscanf 
             && msg.author.id  == constants.uid.mee6bot
             && (msg.content.includes("server") || msg.content.includes("sunucudan"))) {
                const newmsg = await msg.channel.send(nvidia[0]);
                state.cache.module[module_name].nvidias.push(newmsg.id);
                await sync_module();
            }
        break;
        case 'messageReactionAdd':
            const reaction = args.reaction;
            const user = args.user;
            
            if (state.cache.module[module_name].nvidias.includes(reaction.message.id) == false)
                return;

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
            const a = [...reaction.message.reactions.cache.keys()];
            const b = nvidia;
            if (left_diff(b, a).length == 0) {
                let a : string[] = state.cache.module[module_name].nvidias;
                a = a.filter(x=>x!=reaction.message.id);
                state.cache.module[module_name].nvidias = a;
                await reaction.message.channel.send(nvidia_link);
                await reaction.message.delete();
                await sync_module();
            }
            break;
    }
}