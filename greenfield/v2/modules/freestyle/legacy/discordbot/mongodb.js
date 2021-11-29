require("./constants.js");
const { MongoClient } = require("mongodb");
const tools = require("./tools.js");
const fs    = require('fs').promises;

const connstr = consts.env.dbconnstr;
const push_fq = 60*1000; // push frequency

const db_do = async (f, getf=x=>x) => {
    const client = new MongoClient(connstr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const db = client.db(dbname);
        return getf(await f(db));
    } catch (err) {
        console.error(err);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
const db_install_table = (tb) => async(db) => {
    const file = await fs.readFile(__root+"resources/mongodb/data/"+tb+".json");
    const json = JSON.parse(file);
    const collections = (await db.listCollections().toArray()).map(x=>x.name);
    const installed = collections.includes(tb);
    if (!installed) return {"i": (await db.collection(tb).insertMany(json))?.result?.n ?? 0, "e": installed};
    else return {"i": 0, "e": installed};
};
const db_install_keys = () => async(db) => {
    await db.collection(userstb).createIndex({"id": "hashed"});
};
const db_exp_manyget = (ids) => async (db) => {
    const ids = Object.keys(ids);
    if (ids.length == 0) return {};
    return await db.collection(userstb).find({"id": { $in: ids } });
}
const db_exp_manyset = (idexps) => async (db) => {
    await db.collection(userstb).updateMany()
}
const db_get = (tb, id, key="id") => async (db) => {
    let doc = {}
    doc[key]=id;
    const rest = await db.collection(tb).find(doc).limit(1).toArray();
    return rest[0];
}
const db_get_all = (tb, after_find=x=>x) => async (db) => {
    const promise = await after_find(db.collection(tb).find()).toArray();
    return promise;
}
const db_set = (tb, id, doc, key="id") => async (db) => {
    let filter = {};
    filter[key]=id;
    await db.collection(tb).updateOne(filter,
        { $set: doc },
        { upsert: true }
    );
}
const db_push = (tb, id, doc, key="id") => async (db) => {
    let filter = {};
    filter[key]=id;
    await db.collection(tb).updateOne(filter,
        { $push: doc },
        { upsert: true }
    );
}
const db_exp_differ = (id, diff) => async (db) => {
    const e = (await db_get(userstb, id)(db))?.exp ?? 0;
    await db_set(userstb, id.toString(), { exp: e+diff})(db);
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
exports.set_module_state = async (module, json) => db_do(db_set(moduletb, module, { "json": json }));
exports.get_module_state = async (module) => db_do(db_get(moduletb, module), x=>x?.json);
//
exports.get_cards = async () => db_do(db_get_all(cardstb));
exports.get_items = async () => db_do(db_get_all(itemstb));
exports.get_levels = async () => db_do(db_get_all(levelstb,x=>x.sort({ lvl : 1 })));
exports.get_item = async (id) => db_do(db_get(itemstb, id, "Num"));
exports.get_exp = async (id) => db_do(db_get(userstb, id));
exports.differ_exp = async (id, diff) => db_do(db_exp_differ(id, diff));
exports.give_item = async (uid, iid) => db_do(db_push(userstb, uid, {inventory: iid}))
exports.get_inventory = async (uid) => (await db_do(db_get(userstb, uid)))?.inventory;
exports.set_inventory = async (uid, inv) => (await db_do(db_set(userstb, uid, {"inventory": inv})));
exports.get_wear = async (uid) => (await db_do(db_get(userstb, uid)))?.wear;
exports.set_wear = async (uid, wear) => db_do(db_set(userstb, uid, {"wear": wear}))
// generic
exports.get_user_value = async (uid, key) => ((await db_do(db_get(userstb, uid))) ?? {})[key];
exports.set_user_value = async (uid, key, value) => db_do(db_set(userstb, uid, kv(key, value)));
//
const kv = (k, v) => {
    r = {};
    r[k] = v;
    return r;
}
exports.install_db = async() => db_do(async (db) => {

    let res = [];
    for (const tb of alltb) {
        const r = await db_install_table(tb)(db);
        res.push({"table": tb, "inserts": r.i, "exists": r.e});
    }
    return res;
});
// below commands are for utility usage
exports.convert_field_str_to_int = async (tb, id) => db_do(convert_field_str_to_int(tb, id));
const convert_field_str_to_int = (tb, field) => async (db) => {
    const docs = await db.collection(tb).find().toArray();
    const promises = docs.map(data => {
        const filter = {
            "_id": data._id,
        };
        let doc = {}
        doc[field] = parseInt(data[field]);
        return db.collection(tb).updateOne(filter, { $set: doc });
    });
    await Promise.all( promises );
}