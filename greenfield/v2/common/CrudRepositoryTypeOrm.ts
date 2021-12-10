import { throws } from "assert";
import { Connection, EntityTarget } from "typeorm";
import { CrudRepository } from "./CrudRepository";

export class CrudRepositoryTypeOrm<T> 
    extends CrudRepository<T, string>
{
update(entry: T): Promise<boolean> {
    throw new Error("Method not implemented.");
}
delete(entry: T): Promise<boolean> {
    throw new Error("Method not implemented.");
}
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
private repo()
{
    return this.connection!.getRepository(this.target);
}
/*******************************************************************72*/
}