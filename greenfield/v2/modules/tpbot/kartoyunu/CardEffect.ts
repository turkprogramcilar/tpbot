import { CardEffectResult } from "./CardEffectResult";
import { CardPlayKind } from "./CardProperties";
import { CardUser } from "./CardUser";
import { KartOyunu } from "./Main";

export class CardEffect
{
/*******************************************************************72*/
constructor(
    readonly execute: (
        module: KartOyunu,
        owner: CardUser, 
        targets?: [CardUser]
    ) => CardEffectResult,
    readonly playKind = CardPlayKind.Ortaya
)
{
}
get canTarget()
{ 
    return [
        CardPlayKind.Hedefe,
        CardPlayKind["Hedefe veya ortaya"]
    ].includes(this.playKind);
}
/*******************************************************************72*/
}