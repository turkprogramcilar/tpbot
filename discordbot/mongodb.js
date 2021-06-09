const { MongoClient } = require("mongodb");
const dbname = "mongodb_tp"
const exptb = "users_exp"
const connstr = process.env.DCBOT_DBCONNSTR;

const db_do = async (f) => {
    const client = new MongoClient(connstr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const db = client.db(dbname);
        return await f(db);
    } catch (err) {
        console.error(err);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
const db_exp_get = (id) => async (db) => {
    let result = await db.collection(exptb).find({id: id}).limit(1).toArray();
    return result.length==0 ? 0 : result[0].exp;
}
const db_exp_differ = (id, diff) => async (db) => {
    const e = await db_exp_get(id)(db);
    await db.collection(exptb).updateOne(
        { id: id.toString() },
        { $set: { exp: e+diff } },
        { upsert: true }
    );
};
/*
    `db_` functions returns functions that accepts db parameter
    this allows functions to be concatenated (chained) together. ex:

    exports.get_set_exp = async (id, diff) => db_do((db) => {
        db_exp_get(id)(db); db_exp_differ(id, diff)(db);
    })

    here the main db_do() function with try catch finally body
    will first connect to db, then execute 2 functions above, and
    finally close the connection if succesful.
 */
exports.get_exp = async (id) => db_do(db_exp_get(id));
exports.differ_exp = async (id, diff) => db_do(db_exp_differ(id, diff));


/*
// for testing purposes:
exports.get_exp("test").then(res => {
    console.log(res);
});
*/
/*
// for testing purposes 2:
exports.differ_exp("test", 33).then((res) => {
    console.log(res);
    exports.get_exp("test").then(res2 => {
        console.log(res2);
    });
});
*/