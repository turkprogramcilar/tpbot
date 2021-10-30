import { Awaitable } from "discord.js";
import { EventEmitter } from "stream";
import { MessagePort, Worker } from "worker_threads";
import { Print } from "./Print";

export interface Events {
    message: [string],
    /** Used by minion to inform summoner that its fully initialized and listening events */
    risen: [void],
    updateMinionName: [string],
    updateSummonerName: [string],
}
export class Minion
{
    static toSummoner<E extends keyof Events>(parentPort: MessagePort | null, event: E, ...args: Events[E])
    {
        parentPort?.postMessage([event, ...args]);
    }
    static fromSummoner<E extends keyof Events>(parentPort: MessagePort | null, event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        parentPort?.on("message", (pair) => {
            const [pairEvent, ...pairArgs] = pair;
            if (pairEvent === event) {
                listener(...pairArgs);
            }
        });
    }

    private worker: Worker;
    public constructor(public name: string, path: string, data: any, errorCallback: (error: Error) => void)
    {
        this.worker = new Worker(path, { workerData: data });
        this.worker.on("error", errorCallback);
    }

    public when<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        this.worker.on("message", (pair) => {

            // unpack the tuple and check if events match, if so call the listener with args
            const [pairEvent, ...pairArgs] = pair;
            if (pairEvent === event) {
                listener(...pairArgs);
            }
        });
    }
    public emit<E extends keyof Events>(event: E, ...args: Events[E])
    {
        return this.worker.postMessage([event, ...args]);
    }
}