
export interface CallbackMetaData {
    rawSql ?: string
}
export interface Callback {
    status ?: boolean,
    code ?: number,
    msg ?: string,
    metadata ?: CallbackMetaData
}

export interface InsertCallback extends Callback {
    data ?: Array<Object>
}

export interface CreateTableCallback extends Callback {

}

export interface SelectCallback extends Callback {
    data ?: Object[] | any[]
}

export interface DeleteCallback extends Callback {

}