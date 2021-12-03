/*******************************************************************72*/

import { ContextMenuCommandType } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types";
import { TpbotModule } from "./TpbotModule";

/**
 * Command method to match with a discord message
 * @param customRegex Custom regex if you don't want default method name match
 * as command e.g as % is prefix that is your %methodName
 */
export function regex(customRegex?: RegExp, customPrefix?: RegExp)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {

        target.registerRegex(descriptor.value,
            customRegex ?? new RegExp(`^${methodName}`), customPrefix);
    }
}
export const prefixed = (target: TpbotModule, 
    methodName: string, descriptor: PropertyDescriptor) => 
{
    target.registerRegex(descriptor.value, new RegExp(`^${methodName}`));
};
export function slash(description: string)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {
        
        const f = descriptor.value;
        descriptor.value = async (...args: any[]) => {
            try { await f(...args); }
            catch (error) { console.log(error); /* @TODO */ }
        }
        target.registerSlash(descriptor.value, methodName, description);
    }
}
function menu(type: ContextMenuCommandType)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {
        
        target.registerMenu(descriptor.value, methodName, type);
    }
}
export const menuOnUser = (target: TpbotModule, methodName: string, 
    descriptor: PropertyDescriptor) =>
{
    menu(ApplicationCommandType.User)(target, methodName, descriptor);
}
export const menuOnMessage = (target: TpbotModule, methodName: string, 
    descriptor: PropertyDescriptor) =>
{
    menu(ApplicationCommandType.Message)(target, methodName, descriptor);
}
/*******************************************************************72*/