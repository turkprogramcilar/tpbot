import { ContextMenuCommandType } from "@discordjs/builders";
import { Client, CommandInteraction, ContextMenuInteraction, Interaction, Message, MessageComponentInteraction } from "discord.js";
import { Helper } from "./common/Helper";
import { Print } from "./common/Print";
export interface Slash
{
    callback: (interaction: CommandInteraction) => Promise<void> | void, 
    name: string,
    description: string,
}
export interface Menu 
{
    callback: (interaction: ContextMenuInteraction) => Promise<void> | void, 
    name: string,
    type: ContextMenuCommandType
}
export interface Regex
{
    callback: (message: Message, m: RegExpMatchArray) => Promise<void> | void,
    regex: RegExp,
    prefix: RegExp
}
export interface CustomIdRegex
{
    callback: (interaction: MessageComponentInteraction) => Promise<void> | void,
    regex: RegExp,
}
export type Registrar<Type> = {
    [Property in keyof Type as Exclude<Property, "callback">]: Type[Property]
};
export abstract class TpbotModule
{
/*******************************************************************72*/
protected readonly print: Print;
private client?: Client;
private commands?: Regex[];
private slashes?: Slash[];
private regexes?: CustomIdRegex[];
private menus?: Menu[];
constructor(public readonly moduleName: string) 
{ 
    this.print = new Print(moduleName);
    this.print.info("Super constructor ended");
}
get slashCommands()
{ 
    return (this.slashes ?? []).map(x => x as Registrar<Slash>);
}
get menuCommands()
{ 
    return (this.menus ?? []).map(x => x as Registrar<Menu>);
}
setTag(name: string)
{
    this.print.setSurname(name);
}
setClient(client: Client)
{
    this.client = client;
}
registerRegex(
    _callback: (message: Message, m: RegExpMatchArray) => Promise<void> | void, 
    _regex: RegExp,
    _prefix = /^\%\s*/)
{
    if (!this.commands)
        this.commands = [];
    this.commands.push({
        callback: _callback,
        regex: _regex,
        prefix: _prefix
    });
}
registerSlash(
    _callback: (interaction: CommandInteraction) => Promise<void> | void, 
    _name: string, _description: string)
{
    if (!this.slashes)
        this.slashes = [];
    this.slashes.push({
        callback: _callback, name: _name, description: _description
    });
}
registerMenu(
    _callback: (interaction: ContextMenuInteraction) => Promise<void> | void, 
    _name: string, _type: ContextMenuCommandType)
{
    if (!this.menus)
        this.menus = [];
    this.menus.push({
        callback: _callback, name: _name, type: _type
    });
}
registerCustomIdRegex(
    _callback: (interaction: MessageComponentInteraction) => Promise<void> | void,
    _regex: RegExp)
{
    if (!this.regexes)
        this.regexes = [];
    this.regexes.push({
        callback: _callback, regex: _regex
    });
}
/*******************************************************************72*/
async commandProxy(message: Message): Promise<void> 
{ 
    for (const command of this.commands ?? []) {
        if (!message.content.match(command.prefix))
            continue;
        const temp = message.content.replace(command.prefix, "");
        const m = temp.match(command.regex);
        if (m) {
            try {
                await command.callback.apply(this, [message, m]);
            }
            catch (error) {
                this.print.exception(error);
            }
            break;
        }
    }
    await this.textMessage(message);
}
async interactionProxy(int: Interaction): Promise<void>
{
    if (int.isCommand()) {

        const slash = this.slashCallback[int.commandName];
        if (!slash) {
            return;
        }
        return slash.callback.apply(this, [int]);
    }
    else if (int.isContextMenu())
    {

        const menu = this.menuCallback[int.commandName];
        if (!menu) {
            return;
        }
        return menu.callback.apply(this, [int]);
    }
    else if (int.isMessageComponent() 
        && Helper.isMessageInteraction(int.message.interaction)) {
        
        // const commandName = int.message.interaction.commandName;
        const first = (this.regexes ?? []).find(x => int.customId.match(x.regex));
        if (!first)
            return;
        
        await first.callback.apply(this, [int]);
    }
}
// tslint:disable: no-empty
async textMessage(message: Message): Promise<void> { }
async directMessage(message: Message): Promise<void> { }
// tslint:enable: no-empty
/*******************************************************************72*/
protected async guilds()
{
    return (await this.client!.guilds.fetch()).map(x => x);   
}
protected async guild(id: string)
{
    return await this.client!.guilds.fetch(id);
}
protected async channelSend(channelId: string, message: string)
{
    const channel = await this.client!.channels.fetch(channelId);
    if (!channel?.isText())
        return;

    return channel.send(message);
}
/*******************************************************************72*/
// @TODO move property definitions up in class def
private _slashDictionary?: {[key: string]: Slash};
private get slashCallback()
{
    if (!this._slashDictionary)
        this._slashDictionary = (this.slashes ?? []).reduce((a, c) => {
            return {...a, [Helper.debug(c.name)]: c};
        } , {});
    return this._slashDictionary;
}
private _menuDictionary?: {[key: string]: Menu};
private get menuCallback()
{
    if (!this._menuDictionary)
        this._menuDictionary = (this.menus ?? []).reduce((a, c) => {
            return {...a, [Helper.debug(c.name)]: c};
        } , {});
    return this._menuDictionary;
}
/*******************************************************************72*/
}