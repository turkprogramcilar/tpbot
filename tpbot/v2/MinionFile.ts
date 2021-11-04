import { Awaitable } from "discord.js";
import { MessagePort } from "worker_threads";
import { Events } from "./Minion";

export abstract class MinionFile
{

    public toSummoner<E extends keyof Events>(parentPort: MessagePort | null, event: E, ...args: Events[E])
    {
        parentPort?.postMessage([event, ...args]);
    }
    public fromSummoner<E extends keyof Events>(parentPort: MessagePort | null, event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        parentPort?.on("message", (pair) => {
            const [pairEvent, ...pairArgs] = pair;
            if (pairEvent === event) {
                listener(...pairArgs);
            }
        });
    }
}