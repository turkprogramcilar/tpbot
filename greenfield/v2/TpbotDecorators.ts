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

        target.registerRegex(descriptor.value,
            customRegex ?? new RegExp(`^${methodName}`), customPrefix);
    }
}
export const PlainCommand = (target: TpbotModule, 
    methodName: string, descriptor: PropertyDescriptor) => 
{
    target.registerRegex(descriptor.value, new RegExp(`^${methodName}`));
};
export function SlashCommand(description: string)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {
        
        const f = descriptor.value;
        descriptor.value = async (...args: any[]) => {
            try { await f(...args); }
            catch (error) { 
                print.setSurname(target.moduleName).setType(SlashCommand.name)
                    .exception(error);
            }
        }
        target.registerSlash(descriptor.value, methodName, description);
    }
}
function menu(type: ContextMenuCommandType, name: string)
{
    return (target: TpbotModule, methodName: string, 
        descriptor: PropertyDescriptor) => {
        
        const f = descriptor.value;
        descriptor.value = async (...args: any[]) => {
            try { await f(...args); }
            catch (error) { 
                print.setSurname(target.moduleName).setType(SlashCommand.name)
                    .exception(error);
            }
        }
        target.registerMenu(descriptor.value, methodName, type);
    }
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