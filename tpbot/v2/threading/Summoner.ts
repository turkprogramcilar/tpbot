import { Print } from "../common/Print";
import { Minion } from "./Minion";

/*******************************************************************72*/
export class Summoner<T>
{
/*******************************************************************72*/
constructor(protected log: Print) { }

summon(fullpath: string, minionName: string, summonerName: string, 
    errorCallback: (error: Error | unknown) => void, data: T)
{
    this.log.info("Loading file at "+fullpath);
    const minion = new Minion<T>(minionName, fullpath, errorCallback, data);

    minion.once("awaken", () => {
        minion.emit("awakenAcknowledge");
        minion.emit("updateSummonerName", summonerName);
    });
    minion.when("updateMinionName", newName => {
        this.log.info(`Renamed "${minionName}" to "${newName}"`);
        minion.name = minionName = newName;
    });

    return minion;
}

/*UpdateSubDescriptiveName()

GetSubordinate(botId?: number, botName?: string)
{
    if (botId !== undefined) {

    }
    else if (botName !== undefined) {

    }
    else {
        this.print.Warn
    }
}


Kill(botId?: number, botName?: string): void
{
    this.GetSubordinate(botId, botName);
}*/
/*******************************************************************72*/
}