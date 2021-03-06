import path from "path";
import { Helper } from "./Helper";
export abstract class Path
/*******************************************************************72*/
{
static realRoot(...pathSegments: string[])
{
    // Path.js will be in built folder.
    const builtDistance = "../";
    const pathTsDistance = "../../../"
    return path.resolve(__dirname, builtDistance, pathTsDistance,
        ...pathSegments);
}
static greenfieldNonBuilt(...pathSegments: string[])
{
    return this.realRoot("greenfield", ...pathSegments);
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
/*******************************************************************72*/
static builtRoot(...pathSegments: string[])
{
    return this.realRoot("build", ...pathSegments);
}
static builtGreenfield(...pathSegments: string[])
{
    return this.builtRoot("greenfield", ...pathSegments);
}
static builtGreenfieldTests(...pathSegments: string[])
{
    return this.builtRoot("greenfield.tests", ...pathSegments);
}
static builtLatestVersion(...pathSegments: string[])
{
    return this.builtGreenfield("v2", ...pathSegments);
}
static builtModules(...pathSegments: string[])
{
    return this.builtLatestVersion("modules", ...pathSegments);
}
static builtTpbotModules(module: string)
{
    return this.builtModules("tpbot", module.toLowerCase(),
        "Main");
}
static builtFreestyle(...pathSegments: string[])
{
    return this.builtModules("freestyle", ...pathSegments);
}
/*******************************************************************72*/
}