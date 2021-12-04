import { User, Message, MessageInteraction } from "discord.js";
import { Boot } from "../Boot";

export abstract class Helper
{
/*******************************************************************72*/
static get isDebug()
{
    return Helper.check("TPBOT_DEBUG");
}
static debug(postfix: string)
{
    return (Helper.isDebug ? "debug_" : "") + postfix;
}
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
static prefixed(env: string)
{
    return Object.entries(process.env)
        .filter(([k, v]) => k.startsWith(env));
}
static check(env: string): boolean
{
    return process.env[env] !== undefined;
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
/**
 * ps: plural singular
 * returns the given extension if something is larger than 1 unit
 * @param n the count of something countable
 * @param plural default is "s"
 * @param singular default is ""
 */
static ps(n: number, plural = "s", singular = "")
{
    return n > 1 ? plural : singular;
}
/**
 * ai: are is
 * returns "is" if something is larger than 1 else "are"
 * @param n the count of something countable
 */
static ai(n: number)
{
    return this.ps(n, "are", "is");
}
static isMessageInteraction(int: any): int is MessageInteraction
{
    return (int as MessageInteraction)?.commandName !== undefined;
}
/*******************************************************************72*/
}