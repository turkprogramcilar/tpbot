import { buff, card_no } from "./cardgame.data";

export class player
{
    public max_health: number = 100;
    public health: number = this.max_health;
    public buffs: buff[] = [];
    public constructor(public cards: card_no[])
    {

    }

}