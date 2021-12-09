import { MessageComponentInteraction } from "discord.js";
import { CardUser } from "./CardUser";

export class CardEffectResult
{
/*******************************************************************72*/
constructor(
    public ownerAfter?: CardUser,
    public targetsAfter?: [CardUser],
    public effectInteraction?: (interaction: MessageComponentInteraction) => Promise<void>
)
{

}
setEffectInteraction(f: (int: MessageComponentInteraction) => Promise<void>)
{
    this.effectInteraction = f;
    return this;
}

/*******************************************************************72*/
}