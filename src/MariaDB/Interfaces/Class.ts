import {MariaDBConstructorConfig} from "./Config";
import {
    Callback,
    CallbackBackup, CallbackCreateDatabase, CallbackCreateTable,
    CallbackDelete,
    CallbackError, CallbackInsert,
    CallbackSelect,
    CallbackUpdate
} from "./Callback";
import {ConfigConstructor} from "@dkaframework/encryption/dist/Interfaces/Config";

export interface Rules {
    as? : false | string,
    encryption ?: ConfigConstructor | undefined
}

export interface RulesSelectOrderBy {
    column : Array<string> | Array<any>,
    mode? : "ASC" | "DESC"
}

export interface RulesSelectSearch {
    coloumName ?: string
    condition ?: "LIKE" | "=" | "!=" | undefined
    data ?: string | bigint | number
}

export interface RulesSelectSettings {
    database ?: boolean | undefined,
    coloumn ?: boolean | undefined,
    table ?: boolean | undefined,
    rows ?: boolean | undefined
}

export interface RulesSelectJoinOnAlias {
    tableAlias ?: string | undefined,
    collName : string | undefined
}
export interface RulesSelectJoinOn {
    collNameFirst : RulesSelectJoinOnAlias,
    collNameSecond : RulesSelectJoinOnAlias
}
export interface RulesSelectJoin {
    mode ?: | undefined | "INNER" | "ALTER" | "OUTER",
    column ?: Array<String> | undefined,
    TableName ?: string | undefined,
    as ?: string | undefined
    on ?: RulesSelectJoinOn | undefined
}

export interface RulesSelectColumn {
    alias ?: string,
    name ?: string
}
export interface RulesSelect extends Rules {
    join ?: Array<RulesSelectJoin> | RulesSelectJoin | undefined,
    search? : Array<RulesSelectSearch> | RulesSelectSearch | undefined,
    column? : Array<RulesSelectColumn> | Array<string> | undefined,
    limit? : number | undefined,
    orderBy? : RulesSelectOrderBy | undefined
    settings ?: RulesSelectSettings | undefined
}

export interface RulesUpdate extends Rules {
    search : Array<Object | String> | Object | false | any,
    data : Object | Array<Object | String> | false | any
}

export interface RulesDelete extends Rules {
    search : Array<Object | String> | Object | false | any,
}

export interface ExtendsOptionsCreateDatabaseSettings {
    database ?: boolean | undefined,
    coloumn ?: boolean | undefined,
    table ?: boolean | undefined,
    rows ?: boolean | undefined
}
export interface ExtendsOptionsCreateDatabase {
    ifNotExist ?: boolean | undefined,
    encryption ?: ConfigConstructor | undefined,
    settings ?: ExtendsOptionsCreateDatabaseSettings | undefined
}

export type ExtendsOptions = ExtendsOptionsCreateDatabase;

export interface RulesCreateDataBigInt {
    coloumn : string,
    type : "BIGINT",
    index : boolean,
    unique : boolean,
    default ?: null | any
}

export type RulesCreateDataPrimary = {
    coloumn : string,
    autoIncrement : boolean,
    type : "PRIMARY_KEY",
    default ?: null | any
}

export type RulesCreateDataLongText = {
    coloumn : string,
    type : "LONGTEXT",
    default ?: null | any | string
}

export type RulesCreateDataVarchar = {
    coloumn : string,
    type : "VARCHAR",
    length ?: number | undefined,
    default : null | "NOT_NULL" | string
}

export type RulesCreateDataEnum = {
    coloumn : string,
    type : "ENUM",
    values : Array<string | number>,
    default : number | string | null
}

export type CreateTypeColoumn =
    RulesCreateDataPrimary |
    RulesCreateDataBigInt |
    RulesCreateDataVarchar |
    RulesCreateDataEnum |
    RulesCreateDataLongText;


export interface RulesCreateTableSettings {
    database ?: boolean | undefined,
    coloumn ?: boolean | undefined,
    table ?: boolean | undefined
}

export interface RulesCreateTable extends Rules {
    data : Array<CreateTypeColoumn>,
    ifNotExist ?: boolean,
    engine ?: string,
    settings ?: RulesCreateTableSettings | undefined
}

export interface RulesCreateDatabase extends Rules {
    character ?: string | undefined,
    ifNotExist ?: boolean | undefined,
    collation ?: string | undefined
}

export interface RulesInsertSettings {
    database ?: boolean | undefined,
    coloumn ?: boolean | undefined,
    table ?: boolean | undefined
}
export interface RulesInsert extends Rules {
    data? : Object | Array<Object | String> | false | any,
    settings ?: RulesInsertSettings | undefined
}


export interface MariaDBClassInterfaces {

    CreateDB(DatabaseName : string, Rules : RulesCreateDatabase) : Promise<CallbackCreateDatabase>;

    CreateTable(TableName : string, Rules : RulesCreateTable) : Promise<CallbackCreateTable>;

    /**
     * @param TableName the Table Name Format As String
     * @param Rules
     * @constructor
     * @example
     *  <Instance>.Insert(`tes`, { Rules }).then(async (res) => { ... });
     *  @return Promise<CallbackCreate | CallbackError>
     */
    Insert(TableName : string, Rules : RulesInsert) : Promise<CallbackInsert>;
    /**
     *
     * @param TableName the Table Name Format As String
     * @param Rules
     * @constructor
     * @example
     *  <Instance>.Read(`tes`, { Rules }).then(async (res) => { ... })
     *  @return Promise<CallbackRead | CallbackError>
     */
    Select(TableName : string, Rules : RulesSelect) : Promise<CallbackSelect>;

    Update(TableName : string, Rules : RulesUpdate) : Promise<CallbackUpdate>;

    Delete(TableName : string, Rules : RulesDelete) : Promise<CallbackDelete>;

    AutoBackup(enabled : boolean) : Promise<CallbackBackup>;


    /**
     *
     * @param SQLString the Table Name Format As String
     * @param values
     * @param ExtendsOptions
     * @constructor
     * @example
     *  <Instance>.rawQuerySync(`tes`, [ ... ]).then(async (res) => { ... });
     *
     *  @return Promise<CallbackCreate | CallbackRead | CallbackError>
     */
    rawQuerySync<T>(SQLString? : string, values? : any, ExtendsOptions ?: ExtendsOptions) : Promise<T>
}