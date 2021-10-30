import { Print } from "./Print";
import { Summoner } from "./Summoner";
import { Minion } from "./Minion";

import readline from 'readline';

interface BotData
{
    
}
export class Kernel extends Summoner
{
    private readonly botManagerPath = "Bot";

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

    private summonBotManager(botToken: string, botName: string, crashCount: number = 0)
    {
        let bot: Minion;
        bot = this.summon(this.botManagerPath, botName, Kernel.name, (error) => this.whenBotManagerCrashes(bot, error), { token: botToken, crashes: crashCount });
        bot.when("message", message => {
            this.print.from(bot.name).info(message);
            bot.emit("message", "Pong");
        });
    }

    private whenBotManagerCrashes(bot: Minion, error: Error | unknown)
    {
        this.print.error(`Exception level: BotManager[name=${bot.name},crashes=${++bot.data.crashes}]`);
        this.print.exception(error);
        this.summonBotManager(bot.data.token, bot.name, bot.data.crashes);
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