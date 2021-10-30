import { Kernel } from "./Kernel";
import { Print } from "./Print";

const print = new Print("Bootloader");
process.on('uncaughtException', print.Exception);

const legacyEnabled = false;
// check if we need to load legacy codebase
if (legacyEnabled) {
    print.Info("Legacy mode enabled  DCBOT_JSON");
    if (process.env.DCBOT_JSON !== undefined) {

        setTimeout(()=>require("./legacy/main.js"),0);
    }
    else {
        print.Error("Could not load legacy bots because DCBOT_JSON is undefined");
    }
}

print.Info("Initialize Kernel...");
const kernel = new Kernel()// .Start()
    // .finally(print.Info.bind(print, "Finally clause"))
    // .catch(print.Exception);
// this end of file is always reached soon after new kernel line
// therefore start operation is async in parallel
print.Info("End of file");