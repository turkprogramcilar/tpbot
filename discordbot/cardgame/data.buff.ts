import { buff_category, target, alive_until, buff_id, buff } from "./data";

export abstract class status
{
    static builder(id: buff_id, at: target, count: number = 1, alive: alive_until = alive_until.forever): buff
    {
        return {
            buff_id: id,
            type: buff_category.status,
            aim: at,
            life: alive,
            stacks: count,
            actions: []
        };
    }
    static target(id: buff_id, count: number = 1, alive: alive_until = alive_until.forever)
    {
        return this.builder(id, target.enemy, count, alive);
    }
    static self(id: buff_id, count: number = 1, alive: alive_until = alive_until.forever)
    {
        return this.builder(id, target.self, count, alive);
    }
    static combo(id: buff_id, count: number = 1)
    {
        return this.builder(id, target.self, count, alive_until.round_ends);
    }
    static attack_cooldown() { return this.combo(buff_id.attack_cooldown); }

}