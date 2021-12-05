import { CardUser } from "./CardUser";

export interface CardEffectResult
{
    owner: CardUser,
    targets?: [CardUser],
}
export class CardEffect
{
/*******************************************************************72*/
constructor(
    readonly execute: (owner: CardUser, targets?: [CardUser]) => CardEffectResult,
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