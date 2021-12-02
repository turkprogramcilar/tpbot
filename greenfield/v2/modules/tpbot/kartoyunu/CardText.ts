import { CardNo, CardRarity, CardTitle } from "./CardProperties";

export class CardText
{
static getTitle(no: CardNo): string
{
    const list = Object.keys(CardTitle);
    return list.slice(-list.length / 2)[--no as number];
}
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
    return CardText.getTitle(this.no);
}
/*******************************************************************72*/
}