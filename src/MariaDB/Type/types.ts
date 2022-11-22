import {Connection, Pool, PoolCluster} from "mariadb";

export type db_createConnection = "Connection";
export type db_createPoolConnection = "PoolConnection";
export type db_createPoolClusterConnection = "PoolClusterConnection";

export type TableTypeColoumn = "INT" | "BIGINT" | "LONGTEXT" | "TEXT";

export type Method = "CREATE_DB" | "CREATE_TABLE" | "INSERT" | "READ" | "UPDATE" | "DELETE" | "PROCCEDURE" | undefined;
export type Priodic = "HOURS" | "DAILY" | "MONTH" | "YEARS" | undefined;
export type Instance = Promise<Connection> | Pool | PoolCluster | undefined;