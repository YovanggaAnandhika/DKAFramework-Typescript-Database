export interface OptionsSelectDKASqliteSearch {

}


export interface OptionsSelectDKASqlite {
    column ?: Array<string>,
    search ?: OptionsSelectDKASqliteSearch | Array<OptionsSelectDKASqliteSearch>
}


export interface OptionsInsertDKASqlite {
    data : object[] | object
}

export interface OptionsDeleteDKASqliteSearch extends Object {
    _rowId_ ?: number
}
export interface OptionsDeleteDKASqlite {
    search : OptionsDeleteDKASqliteSearch,
}

export interface RulesCreateDataInt {
    coloumn : string,
    type : "INT",
    autoIncrement : boolean
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
    data : Array<CreateTypeColoumn>,
}