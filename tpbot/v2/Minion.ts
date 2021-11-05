import { Awaitable } from "discord.js";
import { EventEmitter } from "stream";
import { MessagePort, Worker } from "worker_threads";
import { Helper } from "./Helper";
import { Print } from "./Print";

export interface Events {
    message: [string],
    /** Used by minion to inform summoner that its fully initialized and listening events */
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
    private log: Print;
    private risen: boolean = false;
    private worker: Worker;
    public constructor(public name: string, path: string, errorCallback: (error: Error) => void, public data: T)
    {
        this.log = new Print(`Minion<${name}>`);
        this.worker = new Worker(path, { workerData: data });
        this.worker.on("error", errorCallback);
        this.once("awaken", () => {
            this.risen = true;
        });
    }

    public async awaken()
    {
        if (this.risen)
            return;

        let counter = 0;
        while (false === this.risen) {

            this.log.info(`await minion awakening N=${++counter}`);
            await Helper.sleep(100);
        }
    }
    public emit<E extends keyof Events>(event: E, ...args: Events[E])
    {
        return this.worker.postMessage([event, ...args]);
    }
    public when<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        this.worker.on("message", (pair) => this.splitPairToListener(pair, event, listener));
    }
    public once<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        this.worker.once("message", (pair) => this.splitPairToListener(pair, event, listener));
    }
    private splitPairToListener<E extends keyof Events>(pair: any, event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        // unpack the tuple and check if events match, if so call the listener with args
        const [pairEvent, ...pairArgs] = pair;
        if (pairEvent === event) {
            listener(...pairArgs);
        }
    }
}