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
static root(...pathSegments: string[])
{
    const distance = pathSegments.reduce((a,_) => a+="../", "../");
    const nested = pathSegments.join("/");
    return path.resolve(__dirname, this.rootDistance, distance, nested);
}
static greenfield(...pathSegments: string[])
{
    return path.resolve(__dirname, "../../", ...pathSegments);
}
static latestVersion(...pathSegments: string[])
{
    return this.greenfield("v2", ...pathSegments);
}
static modules(...pathSegments: string[])
{
    return this.latestVersion("modules", ...pathSegments);
}
static tpbot(module: string)
{
    return this.modules("tpbot", module.toLowerCase(),
        "Main");
}
static freestyle(...pathSegments: string[])
{
    return this.modules("freestyle", ...pathSegments);
}
/*******************************************************************72*/
}