import path from "path";
import { Print } from "./Print";
import { Minion } from "./Minion";

export abstract class Summoner
{
    public constructor(protected print: Print) { }

    public summon(file: string, minionName: string, summonerName: string, data: any, errorCallback: (error: Error | unknown) => void)
    {
        const minion = new Minion(minionName, path.resolve(__dirname, file), data, errorCallback);

        minion.when("risen", () => {
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