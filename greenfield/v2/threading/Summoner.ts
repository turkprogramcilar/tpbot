import { Print } from "../common/Print";
import { MinionCrash } from "./MinionCrash";
import { Minion } from "./Minion";
import { Helper } from "../common/Helper";

export class Summoner<T>
{
/*******************************************************************72*/
public readonly print: Print;
constructor(typeName: string) 
{ 
    this.print = new Print(Summoner.name, undefined, typeName);
}
summon(fullpath: string, minionName: string, summonerName: string, 
    data?: T, errorCallback?: (error: Error | unknown) => void,
    reloadCallback?: (minion: Minion<T>) => void, autoReload = true, 
    crashLimit = 5)
{
    let crashData: MinionCrash<T>;
    const loader = () => this.summonInternal(fullpath, minionName, summonerName,
        crashData, data, errorCallback, reloadCallback);
    crashData = new MinionCrash(autoReload, crashLimit, loader);
    return crashData.loader();
}
private summonInternal(fullpath: string, minionName: string, 
    summonerName: string, crash: MinionCrash<T>, data?: T, 
    errorCallback?: (error: Error | unknown) => void,
    reloadCallback?: (minion: Minion<T>) => void)
{
    this.print.info(`Loading MinionFile<${minionName}> at `+fullpath);


    const minion = new Minion<T>(minionName, fullpath,
        (error) => { 
            if (errorCallback) 
                errorCallback(error); 
            const _minion = this.handleCrash(error, crash, minionName); 
            if (_minion && reloadCallback)
                reloadCallback(_minion);
        }, data);

    minion.once("awaken", () => {
        minion.emit("awakenAcknowledge");
        minion.emit("updateSummonerName", summonerName);
    });

    minion.when("updateMinionName", newName => {
        this.print.info(`Renamed "${minionName}" to "${newName}"`);
        minion.name = minionName = newName;
    });

    return minion;
}
private handleCrash(error: Error | unknown, crash: MinionCrash<T>, name: string)
{
    crash.increase();
    this.print.error(`${name} has crashed.`
        + ` [crashes=${crash.count},`
        + ` ${crash.perMinute.toFixed(2)}/m]`);
    this.print.exception(error);

    if (false === crash.autoReload)
        return;

    // if the bot manager is crashing very fast when summon after summon,
    // stop it launching more
    if (crash.count >= crash.crashLimit && crash.perMinute > 6
        || Helper.check("TPBOT_DEBUG")) {
        this.print.warn(`${name} is stopped reloading due crashing too fast.`
            + ` [crashes=${crash.count},`
            + ` ${crash.perMinute.toFixed(2)}/m]`);
        return;
    }

    return crash.loader();
}
/*******************************************************************72*/
}