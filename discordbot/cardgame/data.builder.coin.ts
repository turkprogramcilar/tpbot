import { coin_action } from "./data";
import { actions } from "./data.builder.action";

export abstract class coin
{
    /**
     * attacks target if heads
     * @param damage amount of damage
     * @returns coin action
     */
    static attack(damage: number): coin_action
    {
        return {heads: actions.attack(damage)};
    }
}