import { Kernel } from "./Kernel";
import { Print } from "./Print";

export class Bootloader
{
    public readonly print = new Print("Bootloader");

    public run()
    {
        if (undefined === process.env.TPBOT) {
            throw new Error("TPBOT environment value is undefined.");
        }

        const legacyEnabled = false;
        // check if we need to load legacy codebase
        if (legacyEnabled) {
            this.print.info("Legacy mode enabled  DCBOT_JSON");
            if (process.env.DCBOT_JSON !== undefined) {
        
                setTimeout(()=>require("./legacy/main.js"),0);
            }
            else {
                this.print.error("Could not load legacy bots because DCBOT_JSON is undefined");
            }
        }
        
        this.print.info("Initialize Kernel...");
        const kernel = new Kernel();
        this.print.info("Finalized Bootloading.");
    }
}
