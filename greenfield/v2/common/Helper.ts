import { User, Message } from "discord.js";
import { Boot } from "../Boot";

export abstract class Helper
{
/*******************************************************************72*/
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
static check(env: string): boolean
{
    return !process.env[env];
}
static isRoot<T extends User | Message | null | undefined>(arg: T)
{
    if (null === arg || undefined === arg)
        return;
    const u = arg instanceof User 
        ? arg.id
        : arg instanceof Message 
            ? (
                arg.member !== null 
                    ? arg.member!.id
                    : arg.author.id
            )
            : null;
    if (null === u || undefined === u || "" === u)
        return false;
    return (Boot.getParsedYaml().shellAccess ?? []).some(x => x.id === u);
}
/*******************************************************************72*/
}