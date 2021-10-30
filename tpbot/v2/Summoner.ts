import path from "path";
import { Print } from "./Print";
import { Minion } from "./Minion";

export class Summoner
{
    public constructor(protected print: Print) { }

    public start(file: string, name: string, data: any, descriptiveName?: string)
    {
        if (undefined === descriptiveName)
            descriptiveName = name;

        const sub = new Minion(this.print, descriptiveName, path.resolve(__dirname, file), data);

        sub.on("updateDescriptiveName", newName => {
            this.print.info(`Renamed "${descriptiveName}" to "${newName}"`);
            descriptiveName = newName;
        })

        return sub;
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