/*******************************************************************72*/
import "reflect-metadata";
import { Boot } from "./Boot";
// tslint:disable: no-console
console.log(`[Power]: `+new Date())
const bootloader = new Boot();
const log = (e: any) => console.error(`[Power]: `, e);
process.on('uncaughtException', log);
bootloader.run().catch(log);
/*******************************************************************72*/