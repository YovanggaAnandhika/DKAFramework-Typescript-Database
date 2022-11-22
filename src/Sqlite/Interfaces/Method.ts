import {RulesSelectJoin} from "../../MariaDB/Interfaces/Class";

export interface OptionsSelectDKASqliteSearch {
    coloumName?: string
    condition?: "LIKE" | "=" | "!=" | "<>" | "<" | ">" | "<=" | ">=" | undefined
    data?: string | bigint | number
}

export interface OptionsSelectDKASqlite {
    as? : false | string,
    column ?: Array<string>,
    join ?: Array<RulesSelectJoin> | RulesSelectJoin | undefined,
    search ?: OptionsSelectDKASqliteSearch | Array<OptionsSelectDKASqliteSearch>
}


export interface OptionsInsertDKASqlite {
    data : object[] | object
}

export interface OptionsDeleteDKASqliteSearch extends Object {
    _rowId_ ?: number
}
export interface OptionsDeleteDKASqlite {
    bypassChange ?: boolean
    search ?: OptionsDeleteDKASqliteSearch,
}

export interface RulesCreateDataInt {
    coloumn : string,
    type : "INT",
    autoIncrement ?: boolean | undefined
}

export type RulesCreateDataText = {
    coloumn : string,
    type : "TEXT",
    default ?: null | any | string
}


export type CreateTypeColoumn =
    RulesCreateDataInt |
    RulesCreateDataText;

export interface OptionsCreateTableDKASqlite {
    ifNotExist ?: boolean
    data : Array<CreateTypeColoumn>,
}