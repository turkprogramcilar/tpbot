import path from "path";
import { Print } from "./Print";
import { Minion } from "./Minion";

export class Summoner<T>
{
    public constructor(protected print: Print) { }

    public summon(file: string, minionName: string, summonerName: string, errorCallback: (error: Error | unknown) => void, data: T)
    {
        const fullpath = path.resolve(__dirname, file);
        this.print.info("Loading file at "+fullpath);
        const minion = new Minion<T>(minionName, fullpath, errorCallback, data);

        minion.when("risen", () => {
            minion.emit("risenAcknowledge");
            minion.emit("updateSummonerName", summonerName);
        });
        minion.when("updateMinionName", newName => {
            this.print.info(`Renamed "${minionName}" to "${newName}"`);
            minion.name = minionName = newName;
        });

        return minion;
    }

    /*public UpdateSubDescriptiveName()

    public GetSubordinate(botId?: number, botName?: string)
    {
        if (botId !== undefined) {

        }
        else if (botName !== undefined) {

        }
        else {
            this.print.Warn
        }
    }


    public Kill(botId?: number, botName?: string): void
    {
        this.GetSubordinate(botId, botName);
    }*/
}