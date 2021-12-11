import { CardUser } from "./CardUser";

import { createConnection } from "typeorm";
import { Helper } from "../../../common/Helper";
import { CrudTypeOrm as CrudTypeOrm } from "../../../common/CrudRepositoryTypeOrm";
import { CardUserRepo } from "./CardUserRepo";

export class CardUserTypeOrm extends CardUserRepo
{
/*******************************************************************72*/
private repo: CrudTypeOrm<CardUser>
constructor()
{
    super();
    this.repo = new CrudTypeOrm(CardUser, () => {
        // const adapter = new SQLiteDatabaseAdapter('./example.sqlite');
        
        const conn: any = Helper.isDebugDb
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
        return createConnection(conn);
    });
}
create(user: CardUser)
{
    return this.repo.create(user);
}
read(key: string)
{
    return this.repo.read(key);
}
update(user: CardUser)
{
    return this.repo.update(user);
}
delete(user: CardUser)
{
    return this.repo.delete(user);
}
/*******************************************************************72*/
}