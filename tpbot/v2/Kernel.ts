import { Print } from "./Print";
import { Summoner } from "./Summoner";
import { Minion } from "./Minion";

import readline from 'readline';

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

            this.print.error(`Exception level: Bot[${bot.name}]`);
            this.print.exception(error);
            //loop();
        }
        const loop = () => {

            bot = this.summon("Bot", "Beta", Kernel.name, { token: botToken }, errorCallback);
            bot.when("message", message => {
                this.print.from(bot.name).info(message);
                bot.emit("message", "Pong");
            });
        };

        loop();

        // this.awaitStdin();
    }

    private awaitStdin() {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('What do you think of Node.js? ', (answer) => {
            console.log(`Thank you for your valuable feedback: ${answer}`);
            rl.close();
        });
    }
}