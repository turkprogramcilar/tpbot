// package imports
import { Message } from "discord.js";
// local imports
import * as constants from "../constants.js";

let state: any = undefined;
export const init = (refState: any) => state = refState;
export const on_event = async (evt: string, args: any) => {
    switch(evt) {
        case "message": const msg: Message = args.msg;
            
            // beyond is admin
            if (!constants.groups.admins.includes(msg.author.id))
                return;

            if (msg.content.includes("%ts_ping")) {
                await msg.channel.send("pong");
            }
        break;
    }
}