import { Bootloader } from "./Bootloader";

const bootloader = new Bootloader();
process.on('uncaughtException', bootloader.print.exception.bind(bootloader));
bootloader.run();