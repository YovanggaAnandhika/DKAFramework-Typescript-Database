

export interface metadata {
    activeConnections : number,
    idleConnections : number,
    totalConnections : number,
    sqlRaw : string,
    lastInsertId? : number | undefined,
    timeExecuteinMilliSecond : number,
    timeExecuteinSecond : number
}
export interface Callback {
    status? : boolean,
    code? : 200 | 404 | 500 | 505 | 301,
    msg? : string,
    metadata? : metadata
}

export interface CallbackBackup extends Callback {
    filename ?: string,
    checksum ?: string | undefined
}

/**
 * @param { Array<Object>} data
 */
export interface CallbackSelect extends Callback{
    data : Array<Object>
}

export interface CallbackUpdate extends Callback {
    affected : number,
    warning : number
}

export interface CallbackDelete extends Callback {
    affected : number,
    warning : number
}


export interface CallbackCreateTable extends Callback {
    data : Array<Object>
}

export interface CallbackCreateDatabase extends Callback {

}

export interface CallbackInsert extends Callback {
    data : Array<Object>
}

export interface CallbackError extends Callback {
    error? : {
        errNo? : number,
        errCode? : string,
        errMsg? : string
    }
}