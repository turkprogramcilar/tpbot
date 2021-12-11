import { CrudRepo as CrudRepo } from "../../../common/CrudRepository";
import { CardUser } from "./CardUser";

export abstract class CardUserRepo extends CrudRepo<CardUser, string>
{
/*******************************************************************72*/
async ensure(id: string)
{
    return (await this.read(id)) ?? new CardUser(id);
}
/*******************************************************************72*/
}