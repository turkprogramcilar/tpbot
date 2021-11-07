import { Kernel } from "./Kernel";
import { Print } from "./Print";

import fs from 'fs'
import YAML from 'yaml'
import path from "path";

interface TpbotYaml {
    shellAccess: {
        tag: string,
        id: string,
        access: boolean
    }[],
    moduleMeapping: {
        tag: string,
        shellBot: boolean,
        modules: string[]
    }[],
}

export class Bootloader
{
    private rootDir: string;
    public readonly print = new Print("Bootloader");

    public constructor()
    {
        this.rootDir = this.load("TPBOT_ROOT_DIR");
    }

    public run()
    {
        const fullPath = this.fromRoot("tpbot", "tpbot.yaml");
        const file = fs.readFileSync(fullPath, 'utf8');
        const parsedYaml: any = YAML.parse(file)
        if (!(parsedYaml as TpbotYaml)) {
            throw new Error("tpbot.yaml file is not in expected format");
        }

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
    private load(env: string): string
    {
        const loaded = process.env[env];
        if (!loaded) {
            throw new Error(env+" environment value is undefined.");
        }
        return loaded;
    }
    private fromRoot(...pathSegments: string[])
    {
        const distance = pathSegments.reduce((a,_) => a+="../", "");
        const nested = pathSegments.join("/");
        return path.resolve(__dirname, this.rootDir, distance, nested);
    }
}
