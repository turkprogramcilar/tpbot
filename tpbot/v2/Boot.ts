/*******************************************************************72*/
import { Kernel } from "./Kernel";
import { Print } from "./Print";

import fs from 'fs'
import YAML from 'yaml'
import path from "path";

export class Boot
{
    static parsedYaml: any;
    static readonly rootDir: string = this.load("TPBOT_ROOT_DIR");
    static load(env: string): string
    {
        const loaded = process.env[env];
        if (!loaded) {
            throw new Error(env+" environment value is undefined.");
        }
        return loaded;
    }
    static fromRoot(...pathSegments: string[])
    {
        const distance = pathSegments.reduce((a,_) => a+="../", "");
        const nested = pathSegments.join("/");
        return path.resolve(__dirname, this.rootDir, distance, nested);
    }
/*******************************************************************72*/
    public readonly print = new Print("Bootloader");

    public run()
    {
        const fullPath = Boot.fromRoot("tpbot", "tpbot.yaml");
        const file = fs.readFileSync(fullPath, 'utf8');
        Boot.parsedYaml = YAML.parse(file)

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
