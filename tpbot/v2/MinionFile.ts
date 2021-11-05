import { Awaitable } from "discord.js";
import { MessagePort, parentPort } from "worker_threads";
import { Helper } from "./Helper";
import { Events } from "./Minion";
import { Print } from "./Print";

export abstract class MinionFile
{
    private risenAck = false;
    protected readonly log;
    public constructor(minionName: string)
    {
        this.log = new Print(`MinionFile<${minionName}>`);
    }
    public async synchronize(onAcknowledge?: () => void): Promise<void>
    {
        if (this.risenAck)
            return;

        this.fromSummonerOnce("awakenAcknowledge", () => {
            this.risenAck = true;
            if (onAcknowledge !== undefined) 
                onAcknowledge();
        });

        let counter = 0;
        while (false === this.risenAck) {

            this.log.info(`ping awaken to summoner N=${++counter}`);
            this.toSummoner("awaken");
            await Helper.sleep(100);
        }
    }
    public toSummoner<E extends keyof Events>(event: E, ...args: Events[E])
    {
        parentPort?.postMessage([event, ...args]);
    }
    public fromSummoner<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        parentPort?.on("message", (pair) => {
            const [pairEvent, ...pairArgs] = pair;
            if (pairEvent === event) {
                listener(...pairArgs);
            }
        });
    }
    public fromSummonerOnce<E extends keyof Events>(event: E, listener: (...args: Events[E]) => Awaitable<void>)
    {
        parentPort?.once("message", (pair) => {
            const [pairEvent, ...pairArgs] = pair;
            if (pairEvent === event) {
                listener(...pairArgs);
            }
        });
    }
}