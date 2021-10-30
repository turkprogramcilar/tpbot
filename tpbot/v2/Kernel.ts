import { Worker } from "worker_threads";
import { Bot } from "./Bot";
import { Print } from "./Print";
import path from "path";

// const keyss = keys<ClientEvents>;
export class Kernel
{
    private print = new Print(Kernel.name);

    // private broadcast(event: eventString) { }

    public async Start()
    {
        if (undefined === process.env.TPBOT) {
            this.print.Warn("TPBOT environment variable is undefined.");
        }

        // const tpbotJson = JSON.parse(process.env.TPBOT);
        const ouroborus = () => {
            const t = process.env.TPBOT;
            let name = t;
            const worker = new Worker(path.resolve(__dirname, 'Bot'), { workerData: { token: t } });
            worker.on("error", e => {
                this.print.Exception(e, name);
                ouroborus();
            });
            worker.on("message", tag => {
                name = tag;
            });
        };
        ouroborus();
        this.print.Info("Start(): Line end");
    }
}