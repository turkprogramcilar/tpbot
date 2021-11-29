import { Print } from "./common/Print";
import { Summoner } from "./threading/Summoner";

import readline from 'readline';
import { Minion } from "./threading/Minion";
import { TpbotClient } from "./TpbotClient";
import { Boot } from "./Boot";
import { Path } from "./common/Path";
import { Helper } from "./common/Helper";

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
    for (const [environmentKey, token] of this.environmentKeyTokens()) {
        if (!token)
            continue;
        this.summonTpClient(token, TpbotClient.name, environmentKey);
    }
}
private loadFreestyles()
{
    this.print.info("Loading Freestyle modules.");
    for (const freestyle of this.yamlFreestyles()) {
        this.summonFreestyle(freestyle);
    }
}
private summonFreestyle(freestyle: string)
{
    this.print.info(`Summoning ${freestyle}`);
    this.summoner.summon(
        Path.freestyle(freestyle),
        freestyle, `freestyle/${freestyle}`);
}
private summonTpClient(botToken: string, botName: string, 
    environmentKey: string)
{
    this.print.info(`Summoning ${environmentKey}`)
    let bot: Minion<BotData>;
    bot = this.summoner.summon(Path.latestVersion(TpbotClient.name),
        botName, Kernel.name, { token: botToken }, 
        (error) => this.handleTpClientCrash(error),
        (minion) => this.initShellListeners(minion));
    this.initShellListeners(bot);
}
private initShellListeners(minion: Minion<BotData>)
{
    minion.when("request", (body) => this.handleRequest(body, minion));
}
private handleTpClientCrash(error: Error | unknown)
{
    this.print.exception(error);
}
private async handleRequest(body: string, minion: Minion<BotData>)
{
    const text = body;
    let buffer = "Kernel: ";
    let pass: RegExpMatchArray | null;
    // tslint:disable: no-conditional-assignment
    if (pass = text.match(/^ping$/)) {
        buffer += "Pong!";
    }
    else if (pass = text.match(/^kill\s*(\d+)$/)) {
        const id = Number(pass[1]);
        const result = await this.summoner.killMinion(id);
        if (null === result)
            buffer += `Minion with id ${id} is not found.`;
        else
            buffer += `Minion is terminated with exit code ${result}.`;
    }
    else if (pass = text.match(/^echo\s*(.+)/)) {
        buffer += pass[1];
    }
    else if (pass = text.match(/^ls\s*(?:(minion)s?|(freestyle)s?|(token)s?)/)) {
        const m = pass.filter(x=>x)[1]; // m: match
        switch (m) {
        case "minion":
            buffer += this.summoner.minionInfos().reduce((a, c) => {
                return a + `\n${c.id} - ${c.name} - ${c.path}`;
            }, "Minions currently running in the system:");
            break;
        case "freestyle":
            buffer += "Freestyle definitions in the yaml configuration:\n"
            buffer += this.yamlFreestyles().join("\n");
            break;
        case "token":
            buffer += "Tokens with prefix found in the environment:\n"
            buffer += this.environmentKeyTokens().map(([k, v]) => k).join("\n");
            break;
        default:
            throw Error("This line is impossible to match. Sort of... Unless" +
            " a lazy developer forgets to implement the case... It's..." +
            " terrible.");
        }
    }
    else if (pass = text.match(/^init\s*(tpbot|freestyle)\s*(.+)$/)) {

        switch (pass[1]) {

        case "tpbot":

            const keyTokens = this.environmentKeyTokens();
            const pair = this.environmentKeyTokens()
                    .find(([k, v]) => k===pass![2]);
            if (pair) {
                if (!pair[1]) {
                    buffer += `Token is found but it has empty string value.`
                }
                else {
                    this.summonTpClient(pair[1], TpbotClient.name, pair[0])
                    buffer += `Summoning ${pair[0]}`;
                }
            }
            else {
                buffer += `${pass[1]} token is not found in the environment.`;
            }
            break;
        case "freestyle":

            if (this.yamlFreestyles().includes(pass[2])) {
                this.summonFreestyle(pass[2]);
                buffer += `Summoning ${pass[2]}`;
            }
            else {
                buffer += `${pass[2]} is not defined in yaml freestyles.`;
            }
            break;
        }
    }
    // else if (pass = text.match(/^$/))
    else {
        buffer += `Unknown command: ${text}`; 
    }
    // tslint:enable: no-conditional-assignment
    minion.emit("response", buffer);
}
private yamlFreestyles()
{
    return (Boot.getParsedYaml().tokenMapping ?? [])
        .map(x => x.modules?.freestyle ?? []).flat();
}
private environmentKeyTokens()
{
    return Helper.prefixed("TPBOT_TOKEN");
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