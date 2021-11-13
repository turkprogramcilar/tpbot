import { alive_until, buff, buff_category, card_no, target, trigger } from "./data";

export const attack_cooldown: buff = {
    type: buff_category.status,
    aim: target.self,
    when: trigger.round_begin,
    life: alive_until.round_ends,
    actions: []
}
export class player
{
    public max_health: number = 100;
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
    public buff(buff: buff) {
        this.buffs.push(buff);
    }
    public has_buff(buff: buff) {
        return this.buffs.includes(buff);
    }

    private change_health(amount: number, percentage: boolean) {

        if (percentage) {
            amount = this.max_health * amount;
        }
        this.health += amount;
    }
}