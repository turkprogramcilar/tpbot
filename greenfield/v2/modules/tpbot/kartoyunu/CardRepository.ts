import { CardEffectDatabase } from "./CardEffectDatabase";
import { CardNo } from "./CardProperties";

export abstract class CardRepository
{
/*******************************************************************72*/
abstract getDeck(id: string): Promise<CardNo[]>;
abstract getUserDeck(id: string): Promise<CardNo[]>;
abstract getSlashDeck(id: string): Promise<CardNo[]>;
/*******************************************************************72*/
}
// tslint:disable-next-line: max-classes-per-file
export class FakeCardRepo extends CardRepository
{
/*******************************************************************72*/
deckRaw: CardNo[] = [1, 2, 3, 5];
getDeck(id: string)
{
    return Promise.resolve(this.deckRaw);
}
getUserDeck(id: string)
{
    return Promise.resolve(this.deckRaw
        .filter(x => CardEffectDatabase[x]?.hasTarget))
}
getSlashDeck(id: string)
{
    return Promise.resolve(this.deckRaw
        .filter(x => !CardEffectDatabase[x]?.hasTarget))

}
/*******************************************************************72*/
}