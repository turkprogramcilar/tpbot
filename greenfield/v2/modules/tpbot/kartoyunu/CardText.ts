import { Helper } from "../../../common/Helper";
import { CardNo, CardRarity, CardTitle } from "./CardProperties";

export class CardText
{
/*******************************************************************72*/
constructor(
    public no: CardNo,
    public rarity: CardRarity,
    public description: string,
    public link: string
)
{

}
get title(): string
{
    return Helper.getEnumText(this.no - 1, CardTitle);
}
get rarityText(): string
{
    return Helper.getEnumText(this.rarity - 1, CardRarity);
}
get categoryText(): string
{
    return "Genel"
}
/*******************************************************************72*/
}