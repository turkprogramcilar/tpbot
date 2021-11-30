import { CardRarity, CardTitle } from "./CardProperties";

/*******************************************************************72*/
export class Card
{
static getTitle(no: CardTitle): string
{
    const list = Object.keys(CardTitle);
    return list.slice(-list.length / 2)[no as number];
}
/*******************************************************************72*/
constructor(
    public no: CardTitle,
    public rarity: CardRarity,
    public description: string,
    public link: string
)
{

}
get title(): string
{
    return Card.getTitle(this.no);
}
/*******************************************************************72*/
}