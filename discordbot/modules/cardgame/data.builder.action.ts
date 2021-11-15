import { action, from } from "./data";

export abstract class actions
{
    static draw_card(count: number): action
    {
        return {
            pick_card: from.self_random,
            card_count: count,
        };
    }
    /**
     * Heals self
     * @param amount default 10
     * @param per default false
     * @returns action
     */
    static heal(amount: number = 10, per: boolean = false): action
    {
        return {
            heal: { self: amount, percentage: per, }
        };
    }
    /**
     * Attacks target
     * @param amount default 10
     * @param per default false
     * @returns action
     */
    static attack(amount: number = 10, per: boolean = false): action
    {
        return {
            attack: {target: amount, percentage: per, }
        };
    }
    static cleanse(): action
    {
        return {
            cleanse: true,
        };
    }
    static purge(): action
    {
        return {
            purge: true,
        };
    }
}