import {MongoClientOptions} from "mongodb";
import {MongoDBCallback, MongoDBCallbackDb, MongoDBCallbackMongoClient} from "./Callback";


export interface MongoDBConfigConstructor {
    host ?: string | undefined,
    port ?: string | number | undefined,
    autoConnect ?: boolean | undefined,
    db ?: string | undefined,
    options ?: MongoClientOptions
}