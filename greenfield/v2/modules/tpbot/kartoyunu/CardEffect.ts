import { CardEffectResult } from "./CardEffectResult";
import { CardUser } from "./CardUser";
import { KartOyunu } from "./Main";

export class CardEffect
{
/*******************************************************************72*/
constructor(
    readonly execute: (module: KartOyunu, owner: CardUser, 
        targets?: [CardUser]) => CardEffectResult,
    readonly targets: number = 0,
)
{
}
get hasTarget()
{
    return this.targets > 0;
}

/*******************************************************************72*/
}