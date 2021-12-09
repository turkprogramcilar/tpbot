import { User } from "discord.js";
import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Helper } from "../../../common/Helper";
import { CardNo, CardTitle } from "./CardProperties";
import { KartOyunu } from "./Main";
const TpbotPrimaryKey = Helper.isDebug
    ? () => PrimaryGeneratedColumn()
    : ObjectIdColumn
    ;
@Entity()
export class CardUser
{
/*******************************************************************72*/
@TpbotPrimaryKey() public _id: any;
@Column() public id: string;
@Column("simple-json") public deck: CardNo[] = Array(
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Echo"],
    CardTitle["Hediye kart"],
    CardTitle["Hediye kart"],
    KartOyunu.rollCard(),
    // KartOyunu.rollCard(),
    // KartOyunu.rollCard(),
);
@Column() public lastDaily: Date = new Date(new Date().getTime() - 1000*60*60*24);
constructor(
    id: string
)
{ 
    this.id = id;
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