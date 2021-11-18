import path from "path";
import { Helper } from "./Helper";
export abstract class Path
/*******************************************************************72*/
{
private static readonly rootDistance: string = Helper.load("TPBOT_ROOT_DIR");
static root(...pathSegments: string[])
{
    const distance = pathSegments.reduce((a,_) => a+="../", "../");
    const nested = pathSegments.join("/");
    return path.resolve(__dirname, this.rootDistance, distance, nested);
}
static greenfieldNonBuilt(file: string)
{
    return this.root("greenfield", file);
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