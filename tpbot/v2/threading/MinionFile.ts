import { Awaitable } from "discord.js";
import { MessagePort, parentPort } from "worker_threads";
import { Helper } from "../common/Helper";
import { Print } from "../common/Print";
import { Events, Minion } from "./Minion";

export abstract class MinionFile
{
/*******************************************************************72*/
private ack = false;
protected readonly print;
constructor(typeName: string)
{
    this.print = new Print(MinionFile.name, undefined, typeName);
}
async synchronize(onAcknowledge?: () => void): Promise<void>
{
    if (this.ack)
        return;

    this.fromSummonerOnce("awakenAcknowledge", () => {
        this.ack = true;
        if (onAcknowledge !== undefined) 
            onAcknowledge();
    });

    let counter = 0;
    while (false === this.ack) {

        this.print.info(`ping awaken to summoner N=${++counter}`);
        this.toSummoner("awaken");
        await Helper.sleep(100);
    }
}
toSummoner<E extends keyof Events>(event: E, ...args: Events[E])
{
    parentPort?.postMessage([event, ...args]);
}
fromSummoner<E extends keyof Events>(event: E, 
    listener: (...args: Events[E]) => Awaitable<void>)
{
    parentPort?.on("message", (pair) => {
        const [pairEvent, ...pairArgs] = pair;
        if (pairEvent === event) {
            listener(...pairArgs);
        }
    });
}
fromSummonerOnce<E extends keyof Events>(event: E, 
    listener: (...args: Events[E]) => Awaitable<void>)
{
    parentPort?.once("message", (pair) => {
        const [pairEvent, ...pairArgs] = pair;
        if (pairEvent === event) {
            listener(...pairArgs);
        }
    });
}
/*******************************************************************72*/
}