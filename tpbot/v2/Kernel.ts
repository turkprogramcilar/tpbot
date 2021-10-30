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
        this.print.info("Initializing...");

        if (undefined === process.env.TPBOT) {
            this.print.warn("TPBOT environment variable is undefined.");
        }

        // const tpbotJson = JSON.parse(process.env.TPBOT);
        const botToken: string | undefined = process.env.TPBOT; // for the moment, we get token directly
        const botName = "Beta";
        let bot: Minion;
        const errorCallback = (error: Error | unknown) => {
            this.print.error(`Exception level: Bot[${bot.descriptiveName}]`);
            this.print.exception(error);
            loop();
        }
        const loop = () => {
            bot = this.summon("Bot", "Beta", { token: botToken }, errorCallback);
            bot.when("message", message => {
                this.print.from(bot.descriptiveName).info(message);
                bot.emit("message", "Pong");
            });
            
        };
        loop();
    }
}