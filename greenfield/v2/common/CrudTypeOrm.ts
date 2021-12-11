import { throws } from "assert";
import { Connection, DeepPartial, EntityTarget, getRepository } from "typeorm";
import { CardUser } from "../modules/tpbot/kartoyunu/CardUser";
import { CrudRepo } from "./CrudRepo";

export interface TypeOrmEntity
{
    id: string
}
export class CrudTypeOrm<T extends TypeOrmEntity> 
    extends CrudRepo<T, string>
{
private connection?: Connection;
/*******************************************************************72*/
constructor(private target: EntityTarget<T>, init: () => Promise<Connection>)
{
    super();
    init().then((_connection) => this.connection = _connection );
}
async create(entity: T)
{
    await this.repo().insert(entity as any);
    await this.repo().save(entity as any);
    return true;
}
async read(key: string)
{
    const result = this.repo().findOne({id: key} as any);
    if (!result)
        return undefined;
    else
        return result;
}
async update(entity: T)
{
    const test = await this.repo().find();
    return true;
}
async delete(entity: T)
{
    await this.repo().delete(entity);
    return true;
}
private repo()
{
    return this.connection!.getRepository(this.target);
}
/*******************************************************************72*/
}