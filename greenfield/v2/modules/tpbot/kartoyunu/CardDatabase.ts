import { CardEffectDatabase } from "./CardEffectDatabase";
import { CardNo, CardTitle } from "./CardProperties";
import { CardRepository } from "./CardRepository";
import { CardUser } from "./CardUser";

import { createConnection, getRepository } from "typeorm";
import { Helper } from "../../../common/Helper";

export class CardDatabase extends CardRepository
{
/*******************************************************************72*/
constructor()
{
    super();
    this.initialize();
}
async initialize()
{
    // const adapter = new SQLiteDatabaseAdapter('./example.sqlite');
    
    const conn: any = Helper.isDebug
        ? {
            type: "sqlite",
            database: ":memory:",
            dropSchema: true,
            entities: [
                CardUser
            ],
            synchronize: true,
            logging: false
        }
        : {
            type: "mongodb",
            url: Helper.load("TPBOT_MONGODB"),
            useNewUrlParser: true,
            database: "test1",
            entities: [
                CardUser
            ],
            synchronize: true,
            logging: false
        };
    await createConnection(conn);
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
    deck.splice(index, 1);
    await getRepository(CardUser).save(user);
    return true;
}
async checkDoDaily(id: string)
{
    const user = await this.getUser(id);
    if (!user.canDaily())
        return false;

    user.lastDaily = new Date();
    user.doDaily();    
    await this.saveUser(user);
    return true;
}
private saveUser(user: CardUser)
{
    return getRepository(CardUser).save(user);
}
private async getUser(_id: string)
{
    let exists = await getRepository(CardUser).findOne({id:  _id});
    if (!exists) {
        exists = new CardUser(_id);
        await getRepository(CardUser).insert(exists);
    }
    
    return exists;
}
/*******************************************************************72*/
}