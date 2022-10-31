import { ConnectionConfig, PoolConfig, PoolClusterConfig} from "mariadb"
import {db_createConnection, db_createPoolClusterConnection, db_createPoolConnection, Priodic} from "../Type/types";
import {ConfigConstructor} from "@dkaframework/encryption/dist/Interfaces/Config";


export interface MariaDBConstructorConfigAutoBackup {
    enabled ?: boolean,
    backupPriodic ?: Priodic | undefined,
    filename ?: string | undefined,
    dumpFileLocation ?: string | undefined,
    extension ?: string | undefined,
    forceReplace ?: boolean,
    compressFile ?: boolean
}

export interface MariaDBConstructorConfigGeneral extends ConnectionConfig, PoolConfig, PoolClusterConfig {
    engine? : db_createConnection | db_createPoolConnection | db_createPoolClusterConnection,
    autoBackup ?: MariaDBConstructorConfigAutoBackup,
    encryption ?: ConfigConstructor | undefined,
}

export interface MariaDBPoolClusterObjectList extends PoolClusterConfig {
    patternName : string,
    selectorConfig : string
}
export type MariaDBConstructorConfig = MariaDBConstructorConfigGeneral