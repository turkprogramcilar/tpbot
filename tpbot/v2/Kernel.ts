/*******************************************************************72*/
import { Print } from "./common/Print";
import { Summoner } from "./threading/Summoner";

import readline from 'readline';
import { Minion } from "./threading/Minion";
import { Helper } from "./common/Helper";
import { ModuleLoader } from "./ModuleLoader";

export type timestamp = number;
export interface CrashInfo
{
    count: number,
    /** Crashes `per minute` */
    perMinute: number,
    lastTimestamp: timestamp | null
}
export interface BotData
{
    token: string,
    crash?: CrashInfo,
}
export class Kernel extends Summoner<BotData>
{
/*******************************************************************72*/
static Increase(before: CrashInfo | undefined): CrashInfo
{
    if (undefined === before) {
        before = {
            count: 0,
            perMinute: 0,
            lastTimestamp: null
        }
    }
    if (null === before.lastTimestamp) {
        before.lastTimestamp = new Date().getTime();
        before.perMinute = Infinity;
        before.count = 1;
    }
    else { 
        before.perMinute /= before.count++;
        const now = new Date().getTime();
        before.perMinute = 1/(1/before.perMinute
            + (now - before.lastTimestamp)/60000);
        before.perMinute *= before.count;
        before.lastTimestamp = now;
    }
    return before;
}
/*******************************************************************72*/
constructor()
{
    super(new Print(Kernel.name));
    this.log.info("Initializing...");

    if (undefined === process.env.TPBOT) {
        this.log.warn("TPBOT environment variable is undefined.");
        throw new Error("Cannot start any bot without TOKEN");
    }

    // const tpbotJson = JSON.parse(process.env.TPBOT);
    const botToken: string | undefined = process.env.TPBOT; 
    // for the moment, we get token directly @TODO
    const botName = "Beta";
    this.summonLoader(botToken, botName);

    // this.awaitStdin();
}

summonLoader(botToken: string, botName: string, crashInfo?: CrashInfo)
{
    let bot: Minion<BotData>;
    bot = this.summon(Helper.fromVLatestCompiled(ModuleLoader.name), botName, Kernel.name, 
        (error) => this.whenLoaderCrashes(bot, error), 
        { token: botToken, crash: crashInfo });
}

private whenLoaderCrashes(bot: Minion<BotData>, error: Error | unknown)
{
    bot.data.crash = Kernel.Increase(bot.data.crash);
    this.log.error(`Exception level: ${ModuleLoader.name}[name=${bot.name}, `
        + `crashes=${bot.data.crash.perMinute}/m]`);
    this.log.exception(error);

    // if the bot manager is crashing very fast when summon after summon,
    // stop it launching more
    if (bot.data.crash.count > 5 && bot.data.crash.perMinute > 6) {
        this.log.warn(`${bot.name} is stopped due crashing too fast. `
            + `[crashes=${bot.data.crash.perMinute}]`);
        return;
    }
    this.summonLoader(bot.data.token, bot.name, bot.data.crash);
}

private awaitStdin()
{

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('What do you think of Node.js? ', (answer) => {
        console.log(`Thank you for your valuable feedback: ${answer}`);
        rl.close();
    });
}
/*******************************************************************72*/
}