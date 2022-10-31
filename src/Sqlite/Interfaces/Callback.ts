

export interface Callback {
    status ?: boolean,
    code ?: number,
    msg ?: string,
}

export interface InsertCallback extends Callback {
    data ?: Array<Object>
}

export interface CreateTableCallback extends Callback {

}

export interface SelectCallback extends Callback {
    data ?: Array<Object>
}

export interface DeleteCallback extends Callback {

}