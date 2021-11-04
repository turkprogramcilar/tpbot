import { Kernel } from "./Kernel";
import { Print } from "./Print";

const print = new Print("Bootloader");
process.on('uncaughtException', print.exception);

if (undefined === process.env.TPBOT) {
    throw new Error("TPBOT environment value is undefined.");
}

const legacyEnabled = false;
// check if we need to load legacy codebase
if (legacyEnabled) {
    print.info("Legacy mode enabled  DCBOT_JSON");
    if (process.env.DCBOT_JSON !== undefined) {

        setTimeout(()=>require("./legacy/main.js"),0);
    }
    else {
        print.error("Could not load legacy bots because DCBOT_JSON is undefined");
    }
}

print.info("Initialize Kernel...");
const kernel = new Kernel();
print.info("Finalized Bootloading.");