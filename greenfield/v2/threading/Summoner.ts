import { Print } from "../common/Print";
import { MinionCrash } from "./MinionCrash";
import { Minion } from "./Minion";
import { Helper } from "../common/Helper";
import { mapDefined } from "tslint/lib/utils";

export class Summoner<T>
{
/*******************************************************************72*/
public readonly print: Print;
private lastMinionId = 0;
private readonly minions: {[key: number]: Minion<T>} = {}
constructor(typeName: string) 
{ 
    this.print = new Print(Summoner.name, undefined, typeName);
}
minionInfos()
{
    return Object.entries(this.minions).map(([stringId, minion]) => { return {
        id: Number(stringId),
        name: minion.name,
        path: minion.path,
    };});
}
/**
 * Returns exit code if successfull, otherwise null if minion with id is not
 * found
 * @param id minion Id to kill
 */
killMinion(id: number): Promise<number> | null
{
    if (!this.minions[id])
        return null;
    const promise = this.minions[id].kill();
    delete this.minions[id];
    return promise;
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

    const minionId = ++this.lastMinionId;
    const minion = this.minions[minionId] = new Minion<T>(minionName, fullpath,
        (error) => { 
            if (errorCallback) 
                errorCallback(error); 
            const _minion = this.handleCrash(error, crash, minionName, minionId); 
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
private handleCrash(error: Error | unknown, crash: MinionCrash<T>, name: string,
    minionId: number)
{
    delete this.minions[minionId];
    crash.increase();
    this.print.error(`${name} has crashed.`
        + ` [crashes=${crash.count},`
        + ` ${crash.perMinute.toFixed(2)}/m]`);
    this.print.exception(error);

    if (false === crash.autoReload)
        return;

    // if the bot manager is crashing very fast when summon after summon,
    // stop it launching more
    if (crash.perMinute > 6
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