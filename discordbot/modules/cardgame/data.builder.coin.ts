import { coin_action } from "./data";

export abstract class coin
{
    /**
     * attacks target if heads
     * @param damage amount of damage
     * @returns coin action
     */
    static attack(damage: number): coin_action
    {
        return {heads: {attack: { target: damage} }};
    }
}