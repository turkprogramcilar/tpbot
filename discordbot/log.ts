export class log {
    constructor (private module_name : string) { }

    private format(msg : string | unknown) : string { return `[${this.module_name}]: ${msg}`; };
    public info(msg : string) { console.log( this.format(msg) ); }
    public warn(msg : string) { console.warn( this.format(msg) ); }
    public error(msg : string | unknown) { console.error( this.format(msg) ); }
}