import { Print } from "./common/Print";
import { Summoner } from "./threading/Summoner";

import readline from 'readline';
import { Minion } from "./threading/Minion";
import { TpbotClient } from "./TpbotClient";
import { Boot } from "./Boot";
import { Path } from "./common/Path";

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
    this.loadFreestyles();
    this.loadTpbotModules();
    this.print.info("Constructor ended");
    // this.awaitStdin();
}
private loadTpbotModules()
{
    this.print.info("Loading Tpbot modules.");
    const tpbotTokens = Object.entries(process.env)
        .filter(([k, v]) => k.startsWith("TPBOT_TOKEN"));
    for (const [environmentKey, token] of tpbotTokens) {
        if (!token)
            continue;
        this.print.info(`Summoning ${environmentKey}`)
        this.summonTpClient(token, TpbotClient.name);
    }
}
private loadFreestyles()
{
    this.print.info("Loading Freestyle modules.");
    const freestyleModules = (Boot.getParsedYaml().tokenMapping ?? [])
        .map(x => x.modules?.freestyle ?? []).flat();
    for (const freestyle of freestyleModules) {
        this.summoner.summon(
            Path.freestyle(freestyle),
            freestyle, `freestyle/${freestyle}`);
    }
}
private summonTpClient(botToken: string, botName: string)
{
    let bot: Minion<BotData>;
    bot = this.summoner.summon(Path.latestVersion(TpbotClient.name),
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