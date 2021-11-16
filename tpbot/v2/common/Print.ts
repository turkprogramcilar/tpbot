export type userInfo = {
    id: string,
    name: string,
}
export class Print
{
/*******************************************************************72*/
private _from: string | undefined = undefined;
private readonly nodejsConsole = console;
constructor(private name: string) { }

private format(message: string | unknown, user?: userInfo): string
{
    return `[${this.name}]: ` + (this._from ? `(from=${this._from}) ` : ``)
        + `${message}` 
        + (user ? ` (user_info: name=${user.name} id=${user.id})` : ``);
};

from(name: string) {
    this._from = name;
    return this;
}
info(message: string, user?: userInfo) 
{ 
    this.nodejsConsole.log(this.format(message, user)); 
}
warn(message: string, user?: userInfo) 
{ 
    this.nodejsConsole.warn(this.format(message, user)); 
}
error(message: string | unknown, user?: userInfo) 
{ 
    this.nodejsConsole.error(this.format(message, user)); 
}
exception(error: Error | unknown, subName?: string)
{
    if (error instanceof Error) {
        this.error((subName ? `(${subName}) ` : "") 
            + `There was an uncaught error.\n\nError Name: ${error.name}\n\n`
            + `Error Message: ${error.message}\n\nError Stack:\n\n`
            + `${error.stack}\n\n`);
    }
    else {
        this.error(`Error object is unknown.`
            + ` String represantation is as follows: [${error}]`);
    }
}
/*******************************************************************72*/
}