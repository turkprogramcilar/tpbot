import { User } from "discord.js";
import { entity, t } from '@deepkit/type';
import { CardNo, CardTitle } from "./CardProperties";
@entity.name(CardUser.name)
export class CardUser
{
/*******************************************************************72*/
constructor(
    @t public id: string,
    @t.array(t.number) public deck: CardNo[] = Array(63, 63, 32, 32, 32),
    @t public lastDaily: Date = new Date()
)
{ 
}

/*******************************************************************72*/
}