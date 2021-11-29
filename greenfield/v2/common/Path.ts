import path from "path";
import { Helper } from "./Helper";
export abstract class Path
/*******************************************************************72*/
{
static root(...pathSegments: string[])
{
    const distance = pathSegments.reduce((a,_) => a+="../", "../");
    const nested = pathSegments.join("/");
    return path.resolve(__dirname, Helper.load("TPBOT_ROOT_DIR"), distance, nested);
}
static greenfieldNonBuilt(...pathSegments: string[])
{
    // the following is the literal root.
    return path.resolve(__dirname, "../../../../", "greenfield", ...pathSegments);
}
static latestVersionNonBuilt(...pathSegments: string[])
{
    return this.greenfieldNonBuilt("v2", ...pathSegments);
}
static modulesNonBuilt(...pathSegments: string[])
{
    return this.latestVersionNonBuilt("modules", ...pathSegments);
}
static tpbotNonBuilt(module: string)
{
    return this.modulesNonBuilt("tpbot", module.toLowerCase(),
        "Main");
}
static freestyleNonBuilt(...pathSegments: string[])
{
    return this.modulesNonBuilt("freestyle", ...pathSegments);
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