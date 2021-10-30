import { Awaitable } from "discord.js";
import { EventEmitter } from "stream";
import { MessagePort, Worker } from "worker_threads";
import { Print } from "./Print";

export interface Events {
    error: [Error],
    message: [string],
    updateDescriptiveName: [string],
}

export declare interface Minion
{
    on<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>): this
    emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean;
}
export class Minion extends EventEmitter
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
    public constructor(private print: Print, public readonly descriptiveName: string, path: string, data: any)
    {
        super();
        this.worker = new Worker(path, { workerData: data });
        this.worker.on("error", e => this.emit("error", e));
    }

    public listen<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        this.worker.on("message", (pair) => {

            // unpack the tuple and check if events match, if so call the listener with args
            const [pairEvent, ...pairArgs] = pair;
            if (pairEvent === event) {
                listener(...pairArgs);
            }
        });
    }
    public raise<E extends keyof Events>(event: E, ...args: Events[E])
    {
        return this.worker.postMessage([event, ...args]);
    }
}