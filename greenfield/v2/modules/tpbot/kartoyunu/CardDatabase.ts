import { Database } from "@deepkit/orm";
import { SQLiteDatabaseAdapter } from '@deepkit/sqlite';
import { CardEffectDatabase } from "./CardEffectDatabase";
import { CardNo, CardTitle } from "./CardProperties";
import { CardRepository } from "./CardRepository";
import { CardUser } from "./CardUser";

export class CardDatabase extends CardRepository
{
private readonly adapter = new SQLiteDatabaseAdapter(':memory:');
private readonly database = new Database(this.adapter, [CardUser]);
private readonly session = this.database.createSession();
/*******************************************************************72*/
constructor()
{
    super();
    this.initialize();
}
async initialize()
{
    // const adapter = new SQLiteDatabaseAdapter('./example.sqlite');
    
    await this.database.migrate();
}
/*******************************************************************72*/
async getDeck(_id: string)
{
    return (await this.getUser(_id)).deck;
}
async getSlashDeck(id: string)
{
    const deck = await this.getDeck(id);
    return deck.filter(x => !CardEffectDatabase[x]?.canTarget);
}
async getUserDeck(id: string) 
{
    const deck = await this.getDeck(id);
    return deck.filter(x => CardEffectDatabase[x]?.canTarget);
}
async hasCard(id: string, no: CardNo)
{
    const deck = await this.getDeck(id);
    return deck.includes(no);
}
async playCard(id: string, no: CardNo)
{
    const user = await this.getUser(id);
    const deck = user.deck;
    if (!deck.includes(no))
        return false;
    
    const index = deck.indexOf(no);
    deck.splice(index, no);
    await this.database.persist(user);
    return true;
}
private async getUser(_id: string)
{
    let exists = await this.database.query(CardUser).filter({id: _id})
        .findOneOrUndefined();
    if (!exists)
        exists = new CardUser(_id);
        this.session.add(exists);
    
    return exists;
}
/*******************************************************************72*/
}