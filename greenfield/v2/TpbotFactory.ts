import { Client } from "discord.js";
import { Crasher } from "./modules/tpbot/crasher/Main";
import { KartOyunu } from "./modules/tpbot/kartoyunu/Main";
import { Ping } from "./modules/tpbot/ping/Main";
import { TpbotModule } from "./TpbotModule";

export abstract class TpbotFactory
{
/*******************************************************************72*/
static instantiate(moduleName: string, client: Client): TpbotModule | null
{
    switch(moduleName) {
    case Crasher.name:   return new Crasher(client);
    case Ping.name:      return new Ping(client);
    case KartOyunu.name: return new KartOyunu(client);
    default: return null;
    }
}
/*******************************************************************72*/
}