
export type userInfo = {
    id: string,
    name: string,
}
export class Print
{
    private _from: string | undefined = undefined;
    private readonly _log = console;
    constructor(private name: string) { }

    private format(message: string | unknown, user?: userInfo): string
    {
        return `[${this.name}]: ` + (this._from ? `(from=${this._from}) ` : ``) + `${message}` + (user ? ` (user_info: name=${user.name} id=${user.id})` : ``);
    };

    public from(name: string) {
        this._from = name;
        return this;
    }

    public info(message: string, user?: userInfo) { this._log.log(this.format(message, user)); }
    public warn(message: string, user?: userInfo) { this._log.warn(this.format(message, user)); }
    public error(message: string | unknown, user?: userInfo) { this._log.error(this.format(message, user)); }

    public exception(e: Error | unknown, subName?: string)
    {
        if (e instanceof Error) {
            this.error((subName ? `(${subName}) ` : "") + `There was an uncaught error.\n\nError Name: ${e.name}\n\nError Message: ${e.message}\n\nError Stack:\n\n${e.stack}\n\n`);
        }
        else {
            this.error(`Error object is unknown. String represantation is as follows: [${e}]`);
        }
    }
}