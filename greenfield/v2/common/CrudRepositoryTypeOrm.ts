import { throws } from "assert";
import { Connection, EntityTarget } from "typeorm";
import { CrudRepository } from "./CrudRepository";

export class CrudRepositoryTypeOrm<T> extends CrudRepository<T, string>
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
    await this.repo().insert(entity);
    await this.repo().save(entity);
    return true;
}
async read(key: string)
{
    const result = this.repo().findOne(key);
    if (!result)
        return undefined;
    else
        return result;
}
async update(entity: T)
{
    await this.repo().save(entity);
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