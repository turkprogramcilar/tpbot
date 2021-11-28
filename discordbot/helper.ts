
export abstract class helper
{
    static get_enum_keys<T extends Object>(enum_t : T) : number[] {
        let o = Object.keys(enum_t);
        o = o.filter(x => !isNaN(Number(x)) && Number(x).toString() === x);
        return o as unknown[] as number[];
    }
    static sleep(ms: number)
    {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
}