import {SqliteFunctionConfiguration} from "./Interfaces/Class";
import DKASqlite from "./Class/DKASqlite";
import * as fs from "fs";

export function Sqlite (config : SqliteFunctionConfiguration) {
    let mSqlite : DKASqlite | undefined = undefined;
    if(fs.existsSync(`${config.filename}`)){
        switch (typeof config.mode) {
            case "number":
                mSqlite = new DKASqlite(config.filename, config.mode, config.key, undefined, config.callback)
                break;
            case "undefined" :
                mSqlite = new DKASqlite(config.filename, undefined, config.key, undefined, config.callback)
                break;
            default :
                mSqlite = new DKASqlite(config.filename, undefined, config.key, undefined)
                break;
        }
    }else{
        mSqlite = new DKASqlite(config.filename, undefined, config.key, true)
    }
    return mSqlite;
}

export default Sqlite;