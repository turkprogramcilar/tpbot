import { Worker } from "worker_threads";
import { Print } from "./Print";
import path from "path";
import { Summoner } from "./Summoner";
import { Minion } from "./Minion";

// const keyss = keys<ClientEvents>;
export class Kernel extends Summoner
{
    public constructor()
    {
        super(new Print(Kernel.name));

        if (undefined === process.env.TPBOT) {
            this.print.Warn("TPBOT environment variable is undefined.");
        }

        // const tpbotJson = JSON.parse(process.env.TPBOT);
        const botToken: string | undefined = process.env.TPBOT; // for the moment, we get token directly
        const botName = "Beta";
        const bot = this.Start("Bot", botName, { token: botToken });

        const loop = (minion: Minion) => {

            minion.listen("message", str => {
                this.print.Info(str);
                minion.raise("message", "Pong");
            });

            minion.on("error", (error) => {
                this.print.Error(`Exception level: Bot[${bot.descriptiveName}]`);
                this.print.Exception(error);
                loop(this.Start("Bot", "Beta", { token: botToken }));
            });
        };
        loop(bot);
    }
}