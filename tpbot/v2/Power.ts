import { Boot } from "./Boot";

const bootloader = new Boot();
// tslint:disable-next-line: no-console
process.on('uncaughtException', e => console.error(`[POWER]:`, e));
bootloader.run();