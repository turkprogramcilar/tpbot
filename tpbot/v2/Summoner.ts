import path from "path";
import { Print } from "./Print";
import { Minion } from "./Minion";

export abstract class Summoner
{
    public constructor(protected print: Print) { }

    public summon(file: string, name: string, data: any, errorCallback: (error: Error | unknown) => void, descriptiveName?: string)
    {
        if (undefined === descriptiveName)
            descriptiveName = name;

        const minion = new Minion(descriptiveName, path.resolve(__dirname, file), data, errorCallback);

        minion.when("updateDescriptiveName", newName => {
            this.print.info(`Renamed "${descriptiveName}" to "${newName}"`);
            minion.descriptiveName = descriptiveName = newName;
        })

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