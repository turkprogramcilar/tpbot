export abstract class Helper
{
    static sleep(ms: number)
    {
        return new Promise(res => setTimeout(res, ms));
    }
}