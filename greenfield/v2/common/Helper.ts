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
/*******************************************************************72*/
}