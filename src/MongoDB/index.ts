import {Db, MongoClient} from "mongodb";
import {
    MongoDBConfigConstructor,
} from "./Interfaces/Config";
import {MongoDBDefaultConfig} from "./Const/Config";
import {
    MongoDBCallback,
    MongoDBCallbackDb,
    MongoDBCallbackError,
    MongoDBCallbackMongoClient
} from "./Interfaces/Callback";

export type MongoDBCallbackChecker<DB> = DB extends { db : string }
    ? MongoDBCallbackDb : MongoDBCallbackMongoClient;

export function MongoDB<DB extends MongoDBConfigConstructor>(config : DB ) : Promise<MongoDBCallbackChecker<DB>> {
    let mURLMongoDB = `mongodb://${config.host}:${config?.port}`;
    const Mongo = new MongoClient(mURLMongoDB, config.options);
    return new Promise(async (resolve, rejected) => {
        if (config.db !== undefined){
            let mDB = Mongo.db(config.db)
            if (config.autoConnect){
                Mongo.connect()
                    .then(async () => {
                        resolve(<MongoDBCallbackDb>{ status : true, code : 200, msg : `successfully connect MongoDB`, db : mDB})
                    })
                    .catch(async (error) => {
                        rejected({ status : false, code : 500, msg : `Error to connect MongoDB`, error : error})
                    })
            }else{
                resolve(<MongoDBCallbackDb>{ status : true, code : 200, msg : `successfully get DB`, db : mDB})
            }
        }else{
            if (config.autoConnect){
                Mongo.connect()
                    .then(async () => {
                        resolve(<MongoDBCallbackMongoClient>{ status : true, code : 200, msg : `successfully connect MongoDB`, mongoClient : Mongo})
                    })
                    .catch(async (error) => {
                        rejected({ status : false, code : 500, msg : `Error to connect MongoDB`, error : error})
                    })
            }else{
                resolve(<MongoDBCallbackMongoClient>{ status : true, code : 200, msg : `successfully to Connect MongoDB`, mongoClient : Mongo})
            }

        }
    })
}
export default MongoDB;