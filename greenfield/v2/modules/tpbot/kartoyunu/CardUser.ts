import { User } from "discord.js";
import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Helper } from "../../../common/Helper";
import { CardEffectData } from "./CardEffectData";
import { CardNo, CardTitle } from "./CardProperties";
import { KartOyunu } from "./Main";
const ReleasePrimaryKey = !Helper.isDebugDb
    ? ObjectIdColumn
    : () => Column("simple-json", {nullable: true})
    ;
const DebugPrimaryKey = Helper.isDebugDb
    ? PrimaryColumn
    : Column
    ;
@Entity()
export class CardUser
{
/*******************************************************************72*/
@ReleasePrimaryKey() public _id: any;
@DebugPrimaryKey() public id: string;
@Column("simple-json") public deck: CardNo[] = Array(
    CardTitle["Echo"],
    CardTitle["Hediye kart"],
    KartOyunu.rollCard(),
);
@Column() public lastDaily: Date = new Date(new Date().getTime() - 1000*60*60*24);
constructor(
    id: string
)
{ 
    this.id = id;
}
getDeck(_id: string)
{
    return this.deck;
}
getSlashDeck()
{
    return this.deck.filter(x => !CardEffectData[x]?.canTarget);
}
getUserDeck() 
{
    return this.deck.filter(x => CardEffectData[x]?.canTarget);
}
hasCard(no: CardNo)
{
    return this.deck.includes(no);
}
playCard(no: CardNo)
{
    if (!this.deck.includes(no))
        return false;
    
    const index = this.deck.indexOf(no);
    this.deck.splice(index, 1);
    return true;
}
checkDoDaily()
{
    if (!this.canDaily())
        return false;

    this.lastDaily = new Date();
    this.doDaily();    
    return true;
}
canDaily()
{
    return 0 !== (this.lastDaily.getDay() - (new Date()).getDay())
}
doDaily()
{
    this.deck.push(KartOyunu.rollCard(), KartOyunu.rollCard());
}
/*******************************************************************72*/
}