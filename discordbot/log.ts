
export type user_info = {
    id: string,
    name: string,
}
export class log {
    constructor (private module_name : string) { }

    private format(msg : string | unknown, user? : user_info) : string { 
        return `[${this.module_name}]: ${msg}` + (user ? ` [user_info: name=${user.name} id=${user.id}]` : ``); 
    };
    public info(msg : string, user? : user_info) { console.log( this.format(msg, user) ); }
    public warn(msg : string, user? : user_info) { console.warn( this.format(msg, user) ); }
    public error(msg : string | unknown, user? : user_info) { console.error( this.format(msg, user) ); }
    public verbose(msg: string, user?: user_info) { if (process.env.DCBOT_VERBOSE !== undefined) this.info(msg, user); }
}