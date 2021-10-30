import { Worker } from "worker_threads";
import { Print } from "./Print";
import path from "path";

// const keyss = keys<ClientEvents>;
export class Kernel
{
    private print = new Print(Kernel.name);

    public constructor()
    {
        if (undefined === process.env.TPBOT) {
            this.print.Warn("TPBOT environment variable is undefined.");
        }

        // const tpbotJson = JSON.parse(process.env.TPBOT);
        const token: string | undefined = process.env.TPBOT; // for the moment, we get token directly
        this.Start(token!, "Beta");
    }

    public Start(botToken: string, botName: string)
    {
        let descriptiveName = botName;
        const worker = new Worker(
            path.resolve(__dirname, 'Bot'),
            {
                workerData: {
                    token: botToken
                }
            },
        );

        worker.on("error", e => {

            this.print.Exception(e, descriptiveName);
            this.Start(botToken, descriptiveName);
        });
        worker.on("message", tag => {

            this.print.Info(`Renamed "${descriptiveName}" to "${tag}"`);
            descriptiveName = tag;
        });
        this.print.Info("Start() End of function");
    }

    public Kill(botId?: number, botName?: string): void
    {
        if (botId !== undefined) {

        }
        else if (botName !== undefined) {

        }
        else {
            this.print.Warn
        }
    }
}