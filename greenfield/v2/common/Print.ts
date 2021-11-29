export type userInfo = {
    id: string,
    username: string,
}
export class Print
{
/*******************************************************************72*/
private from: string | undefined = undefined;
private readonly nodejsConsole = console;
constructor(private name: string, private surname?: string,
    private typeName?: string) { }

private format(message: string | unknown, user?: userInfo): string
{
    const msg = `[${this.name}` + (this.typeName ? `<${this.typeName}>` : ``) 
        + (this.surname ? `|${this.surname}` : ``) 
        +`]: ` + (this.from ? `(from=${this.from}) ` : ``)
        + `${message}` 
        + (user ? ` (user_info: name=${user.username} id=${user.id})` : ``);
    this.from = undefined;
    return msg;
};
setSurname(name: string) {
    this.surname = name;
    return this;
}
setFrom(name: string) {
    this.from = name;
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