import { Message } from "discord.js";

console.log("OKzz");

let state: any = undefined;
export const init = (refState: any) => state = refState;
export const on_event = async (evt: string, args: any) => {
    switch(evt) {
        case "message": const msg: Message = args.msg;

            if (msg.content.includes("%ts_ping")) {
                await msg.channel.send("pong");
            }
        break;
    }
}