
export abstract class CrudRepo<T, PK>
{
/*******************************************************************72*/
abstract create(row: T): Promise<boolean>;
abstract read(key: PK): Promise<T | undefined>;
abstract update(row: T): Promise<boolean>;
abstract delete(row: T): Promise<boolean>;
/*******************************************************************72*/
}