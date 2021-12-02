/*******************************************************************72*/

import { TpbotModule } from "./TpbotModule";

/**
 * Command method to match with a discord message
 * @param customRegex Custom regex if you don't want default method name match
 * as command e.g as % is prefix that is your %methodName
 */
export function command (customRegex?: RegExp, customPrefix?: RegExp)
{
    return (target: TpbotModule, methodName: string, descriptor: PropertyDescriptor) => {
        target.registerCommand(customRegex ?? new RegExp(`^${methodName}`),
            descriptor.value, customPrefix);
    }
}
/*******************************************************************72*/