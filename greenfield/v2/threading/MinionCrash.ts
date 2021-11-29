import { Minion } from "./Minion";

export type timestamp = number;
export interface CrashInfo
{
    count: number,
    /** Crashes `per minute` */
    perMinute: number,
    lastTimestamp: timestamp | null
}
export class MinionCrash<T> implements CrashInfo
{
count: number = 0;
perMinute: number = 0;
lastTimestamp: number | null = null;
constructor(public autoReload: boolean, public crashLimit: number,
    public loader: () => Minion<T>) { }
increase(): void
{
    if (null === this.lastTimestamp) {
        this.lastTimestamp = new Date().getTime();
        this.perMinute = Infinity;
        this.count = 1;
    }
    else { 
        this.perMinute /= this.count++;
        const now = new Date().getTime();
        this.perMinute = 1/(1/this.perMinute
            + (now - this.lastTimestamp)/60000);
        this.perMinute *= this.count;
        this.lastTimestamp = now;
    }
}
/*******************************************************************72*/
}