import { Client } from "discord.js";
import { Crasher } from "./modules/tpbot/crasher/Main";
import { Ping } from "./modules/tpbot/ping/Main";
import { TpbotModule } from "./TpbotModule";

export abstract class TpbotDirectory
{
/*******************************************************************72*/
static getConstructor(moduleName: string): (c: Client) => TpbotModule | null
{
    const moduleDirectory: {[key: string]: (c: Client) => TpbotModule} = {
        [Crasher.name]: c => new Crasher(c),
        [Ping.name]: c => new Ping(c),
    }
    return moduleDirectory[moduleName] ?? null;
}
/*******************************************************************72*/
}