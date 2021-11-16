import { Awaitable } from "discord.js";
import { MessagePort, Worker } from "worker_threads";
import { Helper } from "../common/Helper";
import { Print } from "../common/Print";

export interface Events {
    /** Used by minion to inform summoner that its fully initialized and 
     *  listening events 
     */
    awaken: [void],
    /**
     * Used by Summoner to acknowledge the risen event by minion
     */
    awakenAcknowledge: [void],
    updateMinionName: [string],
    updateSummonerName: [string],
}
export class Minion<T>
{
/*******************************************************************72*/
private log: Print;
private ack: boolean = false;
private worker: Worker;
constructor(public name: string, path: string, 
    errorCallback: (error: Error) => void, public data: T)
{
    this.log = new Print(`Minion<${name}>`);
    this.worker = new Worker(path, { workerData: data });
    this.worker.on("error", errorCallback);
    this.once("awaken", () => {
        this.ack = true;
    });
}
async awaken()
{
    if (this.ack)
        return;

    let counter = 0;
    while (false === this.ack) {

        this.log.info(`await minion awakening N=${++counter}`);
        await Helper.sleep(100);
    }
}
emit<E extends keyof Events>(event: E, ...args: Events[E])
{
    return this.worker.postMessage([event, ...args]);
}
when<E extends keyof Events>(event: E, 
    listener: (...args: Events[E]) => Awaitable<void>)
{
    this.worker.on("message", 
        (pair) => this.splitPairToListener(pair, event, listener));
}
once<E extends keyof Events>(event: E, 
    listener: (...args: Events[E]) => Awaitable<void>)
{
    this.worker.once("message", 
        (pair) => this.splitPairToListener(pair, event, listener));
}
private splitPairToListener<E extends keyof Events>(pair: any, event: E, 
    listener: (...args: Events[E]) => Awaitable<void>)
{
    // unpack the tuple and check if events match, 
    // if so call the listener with args
    const [pairEvent, ...pairArgs] = pair;
    if (pairEvent === event) {
        listener(...pairArgs);
    }
}
/*******************************************************************72*/
}