import { Print } from "./common/Print";
import { Summoner } from "./threading/Summoner";

import readline from 'readline';
import { Minion } from "./threading/Minion";
import { Helper } from "./common/Helper";
import { TpbotClient } from "./TpbotClient";
import { Boot } from "./Boot";

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

    this.print.info("Loading Tpbot modules.");
    const tpbotTokens = Object.entries(process.env)
        .filter(([k, v]) => k.startsWith("TPBOT_TOKEN"));
    for (const [botName, botToken] of tpbotTokens) {
        if (!botToken)
            continue;
        this.summonLoader(botToken, TpbotClient.name);
    }
    this.print.info("Loading Freestyle modules.");
    const freestyleModules = Boot.getParsedYaml().tokenMapping
        .map(x => x.modules?.freestyle ?? []).flat();
    for (const freestyle of freestyleModules) {
        this.summoner.summon(
            Helper.fromVLatestFreeModulesCompiled(freestyle),
            freestyle, `freestyle/${freestyle}`);
    }

    this.print.info("Constructor ended");
    // this.awaitStdin();
}

private summonLoader(botToken: string, botName: string)
{
    let bot: Minion<BotData>;
    bot = this.summoner.summon(Helper.fromVLatestCompiled(TpbotClient.name),
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