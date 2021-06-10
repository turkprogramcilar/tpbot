require("./constants.js");
const { MongoClient } = require("mongodb");
const tools = require("./tools.js");
const fs    = require('fs').promises;

const dbname  = "mongodb_tp"
const exptb   = "users_exp"
const itemstb = "items"
const connstr = consts.env.dbconnstr;
const push_fq = 60*1000; // push frequency

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
const db_install_data_items = () => async(db) => {
    const file = await fs.readFile("./discordbot/data/items.json");
    const json = JSON.parse(file);
    await db.collection(itemstb).insertMany(json);
};
const db_install_keys = () => async(db) => {
    await db.collection(exptb).createIndex({"id": "hashed"});
};
const db_exp_manyget = (ids) => async (db) => {
    const ids = Object.keys(ids);
    if (ids.length == 0) return {};
    return await db.collection(exptb).find({"id": { $in: ids } });
}
const db_exp_manyset = (idexps) => async (db) => {
    await db.collection(exptb).updateMany()
}
const db_get = (tb, id) => async (db) => {
    const rest = await db.collection(tb).find({"id": id}).limit(1).toArray();
    return rest[0];
}
const db_exp_differ = (id, diff) => async (db) => {
    const e = await db_get(exptb, id)(db) ?? 0;
    await db.collection(exptb).updateOne(
        { "id": id.toString() },
        { $set: { exp: e+diff } },
        { upsert: true }
    );
};
/*
    `db_` functions returns functions that accepts db parameter
    this allows functions to be concatenated (chained) together. ex:

    exports.get_set_exp = async (id, diff) => db_do((db) => {
        db_get(exptb, id)(db); db_exp_differ(id, diff)(db);
    })

    here the main db_do() function with try catch finally body
    will first connect to db, then execute 2 functions above, and
    finally close the connection if succesful.
 */
exports.get_item = async (id) => db_do(db_get(itemstb, id));
exports.get_exp = async (id) => db_do(db_get(exptb, id));
exports.differ_exp = async (id, diff) => db_do(db_exp_differ(id, diff));
exp_list = {}
exports.push_differ_exp = (id, diff) => {
    if (exp_list[id]) exp_list[id] += diff;
    else exp_list[id] = diff;
    tools.toggler(exports.push_now, "push_differ_exp", push_fq);
}
exports.push_now = async () => {

}
exports.install_items = async() => db_do(db_install_data_items());


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
const run = async () => {
    const client = new MongoClient(connstr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const db = client.db("test1");
        await db.collection("coltest").updateMany([
            {id: 1, x: 22},
            {id: 2, x: 224},
            {id: 3, x: 26},
            {id: 4, x: 28},
        ]);
    } catch (err) {
        console.error(err);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
//run().catch(console.log);