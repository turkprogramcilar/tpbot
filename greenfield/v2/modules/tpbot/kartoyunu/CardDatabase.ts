import { Database } from "@deepkit/orm";
import { SQLiteDatabaseAdapter } from '@deepkit/sqlite';
import { CardTitle } from "./CardProperties";
import { CardRepository } from "./CardRepository";
import { CardUser } from "./CardUser";

export class CardDatabase extends CardRepository
{
private readonly adapter = new SQLiteDatabaseAdapter(':memory:');
private readonly database = new Database(this.adapter, [CardUser]);
private readonly session = this.database.createSession();
/*******************************************************************72*/
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
private async getUser(_id: string)
{
    let exists = await this.database.query(CardUser).filter({id: _id})
        .findOne();
    if (!exists)
        exists = new CardUser(_id, [CardTitle["Le Umut Peace"]])
        this.session.add(exists);
    return exists;
}
/*******************************************************************72*/
}