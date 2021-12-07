import { CardEffectDatabase } from "./CardEffectDatabase";
import { CardNo } from "./CardProperties";

export abstract class CardRepository
{
/*******************************************************************72*/
abstract getDeck(id: string): Promise<CardNo[]>;
abstract hasCard(id: string, no: CardNo): Promise<boolean>;
abstract playCard(id: string, no: CardNo): Promise<boolean>;
abstract getUserDeck(id: string): Promise<CardNo[]>;
abstract getSlashDeck(id: string): Promise<CardNo[]>;
/*******************************************************************72*/
}
// tslint:disable-next-line: max-classes-per-file
export class FakeCardRepo extends CardRepository
{
/*******************************************************************72*/
deckRaw: CardNo[] = [1, 5, 63, 64];
getDeck(id: string)
{
    return Promise.resolve(this.deckRaw);
}
getUserDeck(id: string)
{
    return Promise.resolve(this.deckRaw
        .filter(x => CardEffectDatabase[x]?.canTarget))
}
getSlashDeck(id: string)
{
    return Promise.resolve(this.deckRaw
        .filter(x => !(CardEffectDatabase[x]?.canTarget)))
}
hasCard(id: string, no: CardNo)
{
    return Promise.resolve(this.deckRaw.includes(no));
}
async playCard(id: string, no: CardNo)
{
    if (!(await this.hasCard(id, no)))
        return Promise.resolve(false);
    
    const index = this.deckRaw.indexOf(no);
    this.deckRaw.splice(index, 1);
        return Promise.resolve(true);
}
/*******************************************************************72*/
}