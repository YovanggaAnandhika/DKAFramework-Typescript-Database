import {OPEN_CREATE, OPEN_READWRITE, OPEN_READONLY, Database} from "sqlite3";
import {
    OptionsCreateTableDKASqlite,
    OptionsDeleteDKASqlite,
    OptionsInsertDKASqlite,
    OptionsSelectDKASqlite
} from "./Method";
import {CreateTableCallback, DeleteCallback, InsertCallback, SelectCallback} from "./Callback";

export type SqliteInstanceCallback = (error : SqliteFunctionCallbackType | Error | null) => void;

export interface DKASqliteImplementationClass {
    CreateTable : (tableName : string, CreateTableOptions : OptionsCreateTableDKASqlite) => Promise<CreateTableCallback>,
    Insert : (tableName : string, InsertOptions : OptionsInsertDKASqlite) => Promise<InsertCallback>,
    Select : (tableName : string, SelectOptions ?: OptionsSelectDKASqlite) => Promise<SelectCallback>,
    Delete : (tableName : string, DeleteOptions : OptionsDeleteDKASqlite) => Promise<DeleteCallback>
}
export interface SqliteFunctionConfigurationWithModeMode{
    OPEN_READONLY : "OPEN_READONLY",
    OPEN_CREATE : "OPEN_CREATE",
    OPEN_READWRITE : "OPEN_READWRITE"
}

export interface SqliteFunctionConfiguration {
    filename : string,
    logger ?: boolean,
    mode ?: number,
    key ?: string,
    callback ?: SqliteInstanceCallback | undefined
}


interface SqliteFunctionCallbackType {
    status ?: boolean,
    code ?: number,
    msg ?: string,
    error ?: Error
}

export type SqliteFunctionCallback = Database