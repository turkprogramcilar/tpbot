/*******************************************************************72*/
import { Kernel } from "./Kernel";
import { Print } from "./common/Print";

import fs from 'fs'
import YAML from 'yaml'
import path from "path";

export class Boot
{
/*******************************************************************72*/
private static _parsedYaml: any | null = null;
static readonly rootDir: string = this.load("TPBOT_ROOT_DIR");
static getParsedYaml(): any
{
    if (this._parsedYaml === null) {
        const fullPath = Boot.fromRoot("tpbot", "tpbot.yaml");
        const file = fs.readFileSync(fullPath, 'utf8');
        this._parsedYaml = YAML.parse(file)
    }
    return this._parsedYaml;
}
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
readonly print = new Print(Boot.name);

run()
{
    if (undefined === process.env.TPBOT) {
        throw new Error("TPBOT environment value is undefined.");
    }

    this.print.info("Initialize Kernel...");
    const kernel = new Kernel();
    this.print.info("Finalized Bootloading.");

    const legacyEnabled = false; // @FIX @TODO 
    // check if we need to load legacy codebase
    if (!legacyEnabled)
        return;
    this.print.info("Legacy mode enabled  DCBOT_JSON");
    if (process.env.DCBOT_JSON !== undefined) {

        setTimeout(()=>require("./legacy/main.js"),0);
    }
    else {
        this.print.error(
            "Could not load legacy bots because DCBOT_JSON is undefined");
    }
}
/*******************************************************************72*/
}
