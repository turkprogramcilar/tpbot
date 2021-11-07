import { Bootloader } from "./Bootloader";

const bootloader = new Bootloader();
// tslint:disable-next-line: no-console
process.on('uncaughtException', e => console.error(`[POWER]:`, e));
bootloader.run();