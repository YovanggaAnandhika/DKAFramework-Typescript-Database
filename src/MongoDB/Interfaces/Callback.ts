import {Db, MongoClient} from "mongodb";


export interface MongoDBCallback {
    status ?: boolean,
    code ?: 200 | 404 | 500 | number | undefined,
    msg ?: string
}
export interface MongoDBCallbackDb extends MongoDBCallback {
    db ?: Db
}

export interface MongoDBCallbackMongoClient extends MongoDBCallback {
    mongoClient ?: MongoClient
}

export interface MongoDBCallbackError extends MongoDBCallback {
    error : Error | any | undefined
}