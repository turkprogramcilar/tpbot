import { CardNo } from "./CardProperties";

export abstract class CardRepository
{
/*******************************************************************72*/
abstract getDeck(id: string): Promise<CardNo[]>;
/*******************************************************************72*/
}
// tslint:disable-next-line: max-classes-per-file
export class FakeCardRepo extends CardRepository
{
/*******************************************************************72*/
getDeck(id: string)
{
    return Promise.resolve([1, 2, 3, 5]);
}
/*******************************************************************72*/
}