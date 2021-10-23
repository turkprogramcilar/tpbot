export class log {
    constructor (private module_name : string) { }

    public info(msg : string) { console.log( `${this.module_name}: ${msg}` ); }
    public warn(msg : string) { console.warn( `${this.module_name}: ${msg}` ); }
    public error(msg : string) { console.error( `${this.module_name}: ${msg}` ); }
}