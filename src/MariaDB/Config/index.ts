import path from "path";
import { MariaDBConstructorConfig as mConfigDatabase } from "../Interfaces/Config"
import {RulesCreateDatabase, RulesCreateTable, RulesInsert, RulesSelect} from "../Interfaces/Class";

export const DatabaseMariaDB : mConfigDatabase = {
    engine : "PoolConnection",
    host : "127.0.0.1",
    user : "root",
    password : "",
    port : 3306,
    database : "test",
    connectionLimit : 100,
    autoBackup : {
        enabled : false,
        backupPriodic : "DAILY",
        filename : "DKAMariaDBBackup",
        extension : ".sql",
        forceReplace : false,
        dumpFileLocation : path.join(require.main?.filename!, "./../Backup/MariaDB"),
        compressFile : false
    }
}
export const CreateTableConfig : RulesCreateTable = {
    data : [],
    ifNotExist: false,
    engine : "innodb",
    settings : {
        database : true,
        coloumn : true,
        table : true
    }
};

export const InsertDataConfig : RulesInsert = {
    settings : {
        database : true,
        coloumn : true,
        table : true
    }
}

export const CreateDatabaseConfig : RulesCreateDatabase = {
    collation : undefined,
    ifNotExist: undefined,
    character : undefined
};

export const SelectConfigDefault : RulesSelect = {
    column : undefined,
    orderBy : undefined,
    limit : undefined,
    search : [],
    settings : {
        database : true,
        coloumn : true,
        table : true,
        rows : true
    }
}
export default DatabaseMariaDB;