/*******************************************************************72*/

import { ContextMenuCommandType } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types";
import { Print } from "./common/Print";
import { TpbotModule } from "./TpbotModule";

const print = new Print("Decorator");
/**
 * Command method to match with a discord message
 * @param customRegex Custom regex if you don't want default method name match
 * as command e.g as % is prefix that is your %methodName
 */
export function RegexCommand(customRegex?: RegExp, customPrefix?: RegExp)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {

        safe(descriptor, methodName, RegexCommand.name);
        target.registerRegex(descriptor.value,
            customRegex ?? new RegExp(`^${methodName}`), customPrefix);
    }
}
export const PlainCommand = (target: TpbotModule, 
    methodName: string, descriptor: PropertyDescriptor) => 
{
    safe(descriptor, methodName, PlainCommand.name);
    target.registerRegex(descriptor.value, new RegExp(`^${methodName}`));
};
export function SlashCommand(description: string)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {
        
        safe(descriptor, methodName, SlashCommand.name);
        target.registerSlash(descriptor.value, methodName, description);
    }
}
export const CustomIdRegex = (regex: RegExp) => 
    (target: TpbotModule, methodName: string, desciptor: PropertyDescriptor) =>
{
    safe(desciptor, target.moduleName, CustomIdRegex.name);
    target.registerCustomIdRegex(desciptor.value, regex);
}
function safe(descriptor: PropertyDescriptor, surname: string, type: string)
{
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        try {
            return await original.bind(this)(...args);
        }
        catch (error) {
            print.setSurname(surname).setType(type).exception(error);
        }
    }
}
const menu = (type: ContextMenuCommandType, name: string) =>
(target: TpbotModule, methodName: string, descriptor: PropertyDescriptor) =>
{        
    safe(descriptor, target.moduleName, name);
    target.registerMenu(descriptor.value, methodName, type);
}
export const UserCommand = (target: TpbotModule, methodName: string, 
    descriptor: PropertyDescriptor) =>
{
    menu(ApplicationCommandType.User, UserCommand.name)
        (target, methodName, descriptor);
}
export const MessageCommand = (target: TpbotModule, methodName: string, 
    descriptor: PropertyDescriptor) =>
{
    menu(ApplicationCommandType.Message, MessageCommand.name)
        (target, methodName, descriptor);
}
/*******************************************************************72*/