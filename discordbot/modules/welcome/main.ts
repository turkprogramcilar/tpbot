import { Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule } from "../../module";

const this_dcmodule = class welcome extends dcmodule {
    
    constructor() { super(welcome.name, false); }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }