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
    private readonly execute: (owner: CardUser, targets?: [CardUser]) => CardEffectResult
)
{

}

/*******************************************************************72*/
}