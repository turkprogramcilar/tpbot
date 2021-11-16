/*******************************************************************72*/
import { Boot } from "./Boot";
// tslint:disable: no-console
console.log(`[Power]: `+new Date())
const bootloader = new Boot();
process.on('uncaughtException', e => console.error(`[Power]: `, e));
bootloader.run();
/*******************************************************************72*/