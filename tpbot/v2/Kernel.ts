import { Print } from "./common/Print";
import { Summoner } from "./threading/Summoner";

import readline from 'readline';
import { Minion } from "./threading/Minion";
import { Helper } from "./common/Helper";
import { BotClient } from "./ModuleLoader";
import { MinionCrash } from "./threading/MinionCrash";

export interface BotData
{
    token: string,
}
export class Kernel
{
/*******************************************************************72*/
private readonly print = new Print(Kernel.name);
private readonly summoner = new Summoner<BotData>(Kernel.name);
constructor()
{
    this.print.info("Constructor has called");

    if (undefined === process.env.TPBOT) {
        this.print.warn("TPBOT environment variable is undefined.");
        throw new Error("Cannot start any bot without TOKEN");
    }

    // const tpbotJson = JSON.parse(process.env.TPBOT);
    const botToken: string | undefined = process.env.TPBOT; 
    // for the moment, we get token directly @TODO
    const botName = "Beta";
    this.summonLoader(botToken, botName);

    this.print.info("Constructor ended");
    // this.awaitStdin();
}

private summonLoader(botToken: string, botName: string)
{
    let bot: Minion<BotData>;
    bot = this.summoner.summon(Helper.fromVLatestCompiled(BotClient.name),
        botName, Kernel.name, { token: botToken });
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