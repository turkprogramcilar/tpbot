
import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../module";

const this_dcmodule = class emojitower extends dcmodule {

    private send_unity_clients : (msg : string) => void = ()=>{};
    
    constructor() { super(emojitower.name, false); }
    
    public async after_init(){
        //const compression = require('compression');
        const PORT = process.env.PORT || process.env.DCBOT_WSPORT || 3000;
        const INDEX = 'www/index.html';

        // https server
        const express = require('express');
        const app = express();
        //server.use(compression());
        app.use(express.static(process.env.WEB_UNITY));
        app.get('/test.html', (req : any, res : any) => res.sendFile(INDEX, { root: __dirname }));
        const httpServer = app.listen(PORT, () => console.log(`Listening on ${PORT}`));


        // websockets server
        const { Server } = require('ws');

        const wss = new Server({ server: httpServer });
        wss.on('connection', (ws : any) => {
            console.log('Client connected');
            ws.on('close', () => console.log('Client disconnected'));
        });

        const xss = require("xss");
        this.send_unity_clients = (msg : string) => {
            wss.clients.forEach((client : any) => {
                client.send(xss(msg));
            });
        };
    }
    public async on_message(msg : Message) {

        const matches = [...msg.content.matchAll(/<a?:\w+:(\d+)>/g)];
        if (matches != null && matches.length > 0) {
            const res = JSON.stringify(matches.map(x=>`https://cdn.discordapp.com/emojis/${x[1]}`));
            //console.log(res);
            this.send_unity_clients(res);
        }
        //<a?:\w+:(\d+)>
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }
