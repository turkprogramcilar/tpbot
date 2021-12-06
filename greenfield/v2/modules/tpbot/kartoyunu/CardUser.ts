import { User } from "discord.js";
import { entity, t } from '@deepkit/type';
import { CardNo, CardTitle } from "./CardProperties";
@entity.name(CardUser.name)
export class CardUser
{
/*******************************************************************72*/
constructor(
    @t public id: string,
    @t.array(t.number) public deck: CardNo[] = Array(5).fill(CardTitle["Hediye kart"]),
    @t public lastDaily: Date = new Date()
)
{ 
}

/*******************************************************************72*/
}