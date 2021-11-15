import { alive_until, buff, buff_category, buff_id, card_no, target, trigger } from "./data";
import { cardgame } from "./game";

export class player
{
    public max_health: number = cardgame.max_health;
    public health: number = this.max_health;
    public buffs: buff[] = [];
    public constructor(public cards: card_no[])
    {

    }

    public hit(amount: number, percentage: boolean) {
        this.change_health(-amount, percentage);
    }
    public heal(amount: number, percentage: boolean) {
        this.change_health(amount, percentage);
    }
    public buff(b: buff) {
        this.buffs.push(b);
    }
    public has_buff(id: buff_id) {
        return this.buffs.some(x => x.buff_id === id);
    }

    private change_health(amount: number, percentage: boolean) {

        if (percentage) {
            amount = this.max_health * amount;
        }
        this.health += amount;
        if (this.health < 0)
            this.health = 0;
        else if(this.health > this.max_health)
            this.health = this.max_health;
    }
}