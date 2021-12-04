import { User } from "discord.js";
import { entity, t } from '@deepkit/type';
import { CardNo } from "./CardProperties";
@entity.name(CardUser.name)
export class CardUser
{
/*******************************************************************72*/
constructor(
    @t public id: string,
    @t public deck: CardNo[],
)
{ 
}

/*******************************************************************72*/
}