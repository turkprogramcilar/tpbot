/*******************************************************************72*/
import path from "path";
export abstract class Helper
/*******************************************************************72*/
{
static readonly rootDistance: string = this.load("TPBOT_ROOT_DIR");
static sleep(ms: number)
{
    return new Promise(res => setTimeout(res, ms));
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
    return path.resolve(__dirname, this.rootDistance, distance, nested);
}
static fromTpbotCompiled(...pathSegments: string[])
{
    return path.resolve(__dirname, "../../", ...pathSegments);
}
static fromVLatestCompiled(...pathSegments: string[])
{
    return this.fromTpbotCompiled("v2", ...pathSegments);
}
/*******************************************************************72*/
}