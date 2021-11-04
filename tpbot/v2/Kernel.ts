import { Print } from "./Print";
import { Summoner } from "./Summoner";
import { Minion } from "./Minion";

import readline from 'readline';

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
            before.perMinute = 1/(1/before.perMinute + (now - before.lastTimestamp)/60000);
            before.perMinute *= before.count;
            before.lastTimestamp = now;
        }
        return before;
    }

    private readonly botManagerPath = "BotManagers";

    public constructor()
    {
        super(new Print(Kernel.name));
        this.print.info("Initializing...");

        if (undefined === process.env.TPBOT) {
            this.print.warn("TPBOT environment variable is undefined.");
            throw new Error("Cannot start any bot without TOKEN");
        }

        // const tpbotJson = JSON.parse(process.env.TPBOT);
        const botToken: string | undefined = process.env.TPBOT; // for the moment, we get token directly
        const botName = "Beta";
        this.summonBotManager(botToken, botName);

        // this.awaitStdin();
    }

    public summonBotManager(botToken: string, botName: string, crashInfo?: CrashInfo)
    {
        let bot: Minion<BotData>;
        bot = this.summon(this.botManagerPath, botName, Kernel.name, (error) => this.whenBotManagerCrashes(bot, error), { token: botToken, crash: crashInfo });
        bot.when("message", message => {
            this.print.from(bot.name).info(message);
            bot.emit("message", "Pong");
        });
    }

    private whenBotManagerCrashes(bot: Minion<BotData>, error: Error | unknown)
    {
        bot.data.crash = Kernel.Increase(bot.data.crash);
        this.print.error(`Exception level: BotManager[name=${bot.name}, `
            + `crashes=${bot.data.crash.perMinute}/m]`);
        this.print.exception(error);

        // if the bot manager is crashing very fast when summon after summon,
        // stop it launching more
        if (bot.data.crash.count > 5 && bot.data.crash.perMinute > 6) {
            this.print.warn(`${bot.name} is stopped due crashing too fast. `
                + `[crashes=${bot.data.crash.perMinute}]`);
            return;
        }
        this.summonBotManager(bot.data.token, bot.name, bot.data.crash);
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
}