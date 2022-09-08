import {Connection, createConnection, createPool, createPoolCluster, Pool} from "mariadb";
import GlobalConfig, {CreateDatabaseConfig, CreateTableConfig, InsertDataConfig, SelectConfigDefault} from "./Config";
import crypto from "crypto";
import {MariaDBConstructorConfig} from "./Interfaces/Config";
import {isArray, isObject, merge, extend, isTypedArray, result} from "lodash";
import {
    Callback,
    CallbackBackup, CallbackCreateDatabase,
    CallbackCreateTable,
    CallbackDelete,
    CallbackError,
    CallbackInsert,
    CallbackSelect,
    CallbackUpdate,
    metadata
} from "./Interfaces/Callback";
import moment, {now} from "moment-timezone";
import {
    ClassInterfaces,
    RulesInsert,
    RulesDelete,
    RulesSelect,
    RulesUpdate,
    RulesCreateDataPrimary,
    ExtendsOptions,
    RulesCreateTable, RulesCreateDatabase
} from "./Interfaces/Class";
import {Instance, Method} from "./Type/types";
import {default as mysqlDump, DumpReturn} from "mysqldump";
import fs from "fs";
import path from "path";
import {default as mEncryption} from "@dkaframework/encryption";

/**
 * @class MariaDB
 * @implements ClassInterfaces
 * @property { CreateTable } MariaDB.CreateTable
 * @property { Select } MariaDB.Select
 * @property { Insert } MariaDB.Insert
 * @property { Update } MariaDB.Update
 * @property { Delete } MariaDB.Delete
 * @description
 * The Class Is a MariaDB Function For Database MariaDB
 * The Base In DKAFramework Application
 */
class MariaDB implements ClassInterfaces {


    /**
     *
     * @private
     * @param {any[]} _mKey
     */
    private _mKey : any[] = [];
    private _mVal : any[] = [];
    private _mWhere : any[] = [];
    private _mSetData : any[] = [];
    private _timeStart = new Date().getTime();

    get timeStart(): number {
        return this._timeStart;
    }

    set timeStart(value: number) {
        this._timeStart = value;
    }

    get mKey(): any[] {
        return this._mKey;
    }

    set mKey(value: any[]) {
        this._mKey = value;
    }

    get mVal(): any[] {
        return this._mVal;
    }

    set mVal(value: any[]) {
        this._mVal = value;
    }

    get mWhere(): any[] {
        return this._mWhere;
    }

    set mWhere(value: any[]) {
        this._mWhere = value;
    }

    get mSetData(): any[] {
        return this._mSetData;
    }

    set mSetData(value: any[]) {
        this._mSetData = value;
    }

    private SqlScript : string = "";

    private mMethod : Method = "READ";
    private mInstance : Instance;
    private mSearchAdd : string = ``;

    private _mConfig : MariaDBConstructorConfig = GlobalConfig;

    private get mConfig(): MariaDBConstructorConfig {
        return this._mConfig;
    }

    private set mConfig(value: MariaDBConstructorConfig) {
        this._mConfig = value;
    }

    private static checkModuleExist(name : string){
        try {
            require.resolve(name);
            return true;
        }catch (e) {
            return false;
        }
    }


    /**
     * @constructor
     * @param {Config | undefined } config
     * @return this;
     */
    constructor(config? : MariaDBConstructorConfig) {
        this.mConfig = merge(GlobalConfig, config);
        switch (this.mConfig.engine) {
            case "Connection" :
                this.mInstance = createConnection(this.mConfig);
                break;
            case "PoolConnection" :
                this.mInstance = createPool(this.mConfig);
                break;
            case "PoolClusterConnection" :
                this.mInstance = createPoolCluster(this.mConfig);
                break;
        }
        moment.locale("id")
        return this;
    }

    async CreateDB(DatabaseName : string, Rules : RulesCreateDatabase = CreateDatabaseConfig) : Promise<CallbackCreateDatabase> {
        let mRules: RulesCreateDatabase = await merge(CreateDatabaseConfig,{
            encryption : this.mConfig.encryption
        }, Rules);
        this.timeStart = new Date().getTime();

        let mQuery = ``;

        return new Promise(async (resolve, rejected) => {
            let ifNotExists = (mRules.ifNotExist !== undefined && mRules.ifNotExist) ? `IF NOT EXISTS` : ``;
            let characterSet = (mRules.character !== undefined) ? `CHARACTER SET ${mRules.character}` : ``;
            let collation = (mRules.collation !== undefined) ? `COLLATE ${mRules.collation}` : ``;
            if (mRules.encryption !== undefined){
                if (MariaDB.checkModuleExist("@dkaframework/encryption")){
                    let mEncryption = require("@dkaframework/encryption").default;
                    let mDatabase = new mEncryption(mRules.encryption).encodeIvSync(DatabaseName);
                    mQuery = `CREATE DATABASE ${ifNotExists} \`${mDatabase}\` ${characterSet} ${collation};`;
                    this.mMethod = "CREATE_DB";
                    await this.rawQuerySync<CallbackCreateDatabase>(mQuery, [], { ifNotExist : mRules.ifNotExist})
                        .then(async (result) => {
                            await resolve(result);
                        }).catch(async (error) => {
                            await rejected(<CallbackError>error);
                        });
                }else{
                    rejected(<CallbackError>{ status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `});
                }
            }else{
                mQuery = `CREATE DATABASE ${ifNotExists} \`${DatabaseName}\` ${characterSet} ${collation};`;
                this.mMethod = "CREATE_DB";
                await this.rawQuerySync<CallbackCreateDatabase>(mQuery, [], { ifNotExist : mRules.ifNotExist})
                    .then(async (result) => {
                        await resolve(result);
                    }).catch(async (error) => {
                        await rejected(<CallbackError>error);
                    });
            }
        });
    }

    /**
     * @method
     */
    async CreateTable(TableName: string, Rules : RulesCreateTable = CreateTableConfig): Promise<CallbackCreateTable> {
        let mRules : RulesCreateTable = await merge(CreateTableConfig, {
            encryption : this.mConfig.encryption
        }, Rules);
        this.timeStart = new Date().getTime();

        let mQuery = ``;
        let mFinalQuery = ``;
        let length : number;
        let mDefault : string;

        return new Promise(async (resolve, rejected) => {
            mRules.data.forEach((value) => {
                switch (value.type) {
                    case "PRIMARY_KEY" :
                        let autoIncrement = (value.autoIncrement) ? "AUTO_INCREMENT" : "";
                        if (mRules.encryption !== undefined) {
                            if (MariaDB.checkModuleExist("@dkaframework/encryption")) {
                                let mEncryption = require("@dkaframework/encryption").default;
                                let mColoumnName = new mEncryption(mRules.encryption).encodeIvSync(value.coloumn);
                                let mTableNameEncrypt = (mRules.settings?.coloumn) ? mColoumnName : value.coloumn;
                                mQuery += ` \`${mTableNameEncrypt}\` BIGINT PRIMARY KEY ${autoIncrement}`;
                            }else{
                                return { status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `};
                            }
                        }else{
                            mQuery += ` \`${value.coloumn}\` BIGINT PRIMARY KEY ${autoIncrement}`;
                        }

                        break;
                    case "VARCHAR" :
                        length = (value.length !== undefined) ? value.length : 20;
                        mDefault = (value.default === null) ? `DEFAULT NULL` : `NOT NULL`;
                        mQuery += ` \`${value.coloumn}\` VARCHAR(${length}) ${mDefault}`;
                        break;
                    case "LONGTEXT" :
                        mDefault = (value.default === null) ? `DEFAULT NULL` : `NOT NULL`;
                        if (mRules.encryption !== undefined) {
                            if (MariaDB.checkModuleExist("@dkaframework/encryption")) {
                                let mEncryption = require("@dkaframework/encryption").default;
                                let mColoumnName = new mEncryption(mRules.encryption).encodeIvSync(value.coloumn);
                                let mTableNameEncrypt = (mRules.settings?.coloumn) ? mColoumnName : value.coloumn;
                                mQuery += ` \`${mTableNameEncrypt}\` LONGTEXT ${mDefault}`;
                            }else{
                                return { status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `};
                            }
                        }else{
                            mQuery += ` \`${value.coloumn}\` LONGTEXT ${mDefault}`;
                        }

                        break;
                    case "ENUM" :
                        mDefault = (value.default === null) ? `DEFAULT NULL` : ` DEFAULT '${value.default}'`;
                        let ms = `'${value.values.join(`','`)}'`;
                        mQuery += ` \`${value.coloumn}\` ENUM(${ms}) ${mDefault}`;
                        break;

                }
                mQuery += `,`;
            });

            /** Remove (,) in last statment **/
            mQuery = mQuery.substring(0, mQuery.length - 1);

            let mIfNotExist = (mRules.ifNotExist) ? "IF NOT EXISTS " : "";
            let mEngine = (mRules.engine !== undefined) ? `ENGINE ${mRules.engine}` : ``;

            if (mRules.encryption !== undefined) {
                if (MariaDB.checkModuleExist("@dkaframework/encryption")) {
                    let mEncryption = require("@dkaframework/encryption").default;

                    let mTableName = new mEncryption(mRules.encryption).encodeIvSync(TableName);
                    let mTableNameEncrypt = (mRules.settings?.table) ? mTableName : TableName;

                    let mDatabase = new mEncryption(mRules.encryption).encodeIvSync(this.mConfig.database);
                    let mDatabaseEncrypt = (mRules.settings?.database) ? mDatabase : this.mConfig.database;
                    let mConvertToScript = `\`${mDatabaseEncrypt}\`.`;

                    mFinalQuery = `CREATE TABLE ${mIfNotExist}${mConvertToScript}\`${mTableNameEncrypt}\`(${mQuery}) ${mEngine};`;
                    this.mMethod = "CREATE_TABLE";
                    await this.rawQuerySync<CallbackCreateTable>(mFinalQuery,[], { ifNotExist : mRules.ifNotExist })
                        .then(async (result) => {
                            await resolve(result);
                        }).catch(async (error) => {
                            await rejected(<CallbackError>error);
                        });

                }else{
                    await rejected(<CallbackError>{ status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `});
                }
            }else{
                mFinalQuery = `CREATE TABLE ${mIfNotExist}\`${TableName}\`(${mQuery}) ${mEngine};`;
                this.mMethod = "CREATE_TABLE";

                await this.rawQuerySync<CallbackCreateTable>(mFinalQuery,[], { ifNotExist : mRules.ifNotExist })
                    .then(async (result) => {
                        await resolve(result);
                    })
                    .catch(async (error) => {
                        await rejected(<CallbackError>error);
                    });

            }
        })

    }

    /**
     * @method
     * @name CreateTable
     */
    BuatTable = this.CreateTable;

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesInsert} Rule - <b>Rules</b><br/>
     * The Rules is Parameter Options For Insert <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackCreate | CallbackError> - <b>Promise<CallbackCreate | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Insert(TableName : string, Rule : RulesInsert = InsertDataConfig) : Promise<CallbackInsert> {
        this.timeStart = new Date().getTime();
        let Rules : RulesInsert = merge(InsertDataConfig, {
            encryption : this.mConfig.encryption
        }, Rule);

        return new Promise(async (resolve, rejected) => {
            if (isObject(Rules.data)){
                this.mKey = [];
                this.mVal = [];
                /** Check Module Encryption Declaration **/
                if (Rules.encryption !== undefined) {
                    if (MariaDB.checkModuleExist("@dkaframework/encryption")) {
                        let mEncryption = require("@dkaframework/encryption").default;

                        /** Refactor Table Name to Encryption **/
                        let mTableName = new mEncryption(Rules.encryption).encodeIvSync(TableName);
                        let mTableNameEncrypt = (Rules.settings?.table) ? mTableName : TableName;
                        /** Refactor Database Name **/
                        let mDatabase = new mEncryption(Rules.encryption).encodeIvSync(this.mConfig.database);
                        let mDatabaseEncrypt = (Rules.settings?.database) ? mDatabase : this.mConfig.database;
                        let mConvertToScript = `\`${mDatabaseEncrypt}\`.`;

                        /** **
                         * Looping Key And Val For Raw Script
                         */
                        await Object.keys(Rules.data).forEach((key) => {
                            /** Refactor Key If Or Not Encryption **/
                            let mKey = new mEncryption(Rules.encryption).encodeIvSync(key);
                            let mKeyEncrypt = (Rules.settings?.coloumn) ? mKey : key;
                            this.mKey.push(` \`${mKeyEncrypt}\` `);
                            /** Refactor Val If Or Not Encryption **/
                            let mVal = new mEncryption(Rules.encryption).encodeIvSync(Rules.data[key]);
                            let mValEncrypt = (Rules.settings?.coloumn) ? mVal : Rules.data[key];
                            this.mVal.push(`"${ mValEncrypt}"`);
                        });
                        /** Generate SQL Script Raw **/
                        this.SqlScript = `INSERT INTO ${mConvertToScript}\`${mTableNameEncrypt}\` (${this.mKey})VALUES (${this.mVal}) `;

                    }else{
                        return { status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `};
                    }
                }else{
                    await Object.keys(Rules.data).forEach((key) => {
                        this.mKey.push(` \`${key}\` `);
                        this.mVal.push(`"${ Rules.data[key]}"`);
                    });

                    this.SqlScript = `INSERT INTO \`${TableName}\` (${this.mKey})VALUES (${this.mVal}) `;
                }
            }else if (isArray(Rules.data)){
                //@@@@@@@@@@@@@@@@@@@
                this.mVal = [];
                this.mKey = [];
                this.mSetData = [];
                //@@@@@@@@@@@@@@@@@@@

                //**********************************************************
                Rules.data.map(async (item, index) => {
                    this.mKey = [];
                    this.mSetData = [];
                    //######################################################
                    Object.keys(item).map(async (key) => {
                        this.mKey.push(`${key}`);
                        this.mSetData.push(`"${Rules.data[index][key]}"`);
                    });
                    //#######################################################
                    this.mVal.push(`(${this.mSetData})`)
                });
                //************************************************************
                this.SqlScript = `INSERT INTO ${TableName} (${this.mKey})VALUES ${this.mVal} `;
            }
            //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
            this.mMethod = "INSERT";
            //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
            await this.rawQuerySync<CallbackInsert>(this.SqlScript,[])
                .then(async (result) => {
                    await resolve(result);
                })
                .catch(async (error) => {
                    await rejected(<CallbackError>error);
                });

        })
    };

    /**
     * @name Insert
     */
    Create = this.Insert;
    Buat = this.Insert;

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesSelect} Rules - <b>Rules</b><br/>
     * The Rules is Parameter Options For Read <b>Database Function</b><br/>
     * ---------
     * @memberOf MariaDB
     * @return Promise<CallbackSelect | CallbackError> - <b>Promise<CallbackSelect | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Select(TableName : string, Rules : RulesSelect = SelectConfigDefault): Promise<CallbackSelect> {

        let mRules : RulesSelect = merge(SelectConfigDefault, {
            encryption : this.mConfig.encryption
        }, Rules);

        this.timeStart = new Date().getTime();
        this.mSearchAdd = ``;

        return new Promise(async (resolve, rejected) => {
            if (mRules !== undefined){
                if (isArray(mRules.search)){
                    await mRules.search.forEach((item : any) => {
                        if (isObject(item)){
                            let mItem : any = item;
                            Object.keys(mItem).forEach((k) => {
                                this.mSearchAdd += `\`${k}\`=\'${mItem[k]}\'`;
                            });
                        }else{
                            this.mSearchAdd += ` ${item} `;
                        }
                    });
                }else if (isObject(mRules.search)){
                    this.mSearchAdd += `\`${mRules.search.coloumName}\` = '${mRules.search.valueName}' `;
                }

                const UpdateWhere = (mRules.search !== undefined) ? `WHERE ${this.mSearchAdd}` : ``;
                const SelectColumn = (mRules.column !== undefined && mRules.column.length > 0 ) ? mRules.column : `*`;
                const SelectLimit = (mRules.limit !== undefined) ? `LIMIT ${mRules.limit}` : ``;
                const SelectOrderBy = (mRules.orderBy !== undefined && mRules.orderBy.column.length > 0) ? `ORDER BY ${mRules.orderBy.column} ${mRules.orderBy.mode}` : ``;
                const selectParentAs = (mRules.as !== undefined && mRules.as !== false) ? ` as \`${mRules.as}\`` : ``;

                if (mRules.encryption !== undefined){
                    if (MariaDB.checkModuleExist("@dkaframework/encryption")) {
                        let mEncryption = require("@dkaframework/encryption").default;

                        /** Refactor Table Name to Encryption **/
                        let mTableName = new mEncryption(mRules.encryption).encodeIvSync(TableName);
                        let mTableNameEncrypt = (mRules.settings?.table) ? mTableName : TableName;

                        /** Refactor Database Name **/
                        let mDatabase = new mEncryption(mRules.encryption).encodeIvSync(this.mConfig.database);
                        let mDatabaseEncrypt = (mRules.settings?.database) ? mDatabase : this.mConfig.database;
                        let mConvertToScript = `\`${mDatabaseEncrypt}\`.`;

                        const mSQL = `SELECT ${SelectColumn} FROM ${mConvertToScript}\`${mTableNameEncrypt}\`${selectParentAs} ${UpdateWhere} \n ${SelectOrderBy} ${SelectLimit}`;
                        this.mMethod = "READ";
                        await this.rawQuerySync<CallbackSelect>(mSQL,[], {encryption : mRules.encryption, settings : mRules.settings })
                            .then(async (result) => {
                                await resolve(result);
                            })
                            .catch(async (error) => {
                                await rejected(<CallbackError>error);
                            })
                    }else{
                        await rejected(<CallbackError>{ status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `});
                    }
                }else{
                    const mSQL = `SELECT ${SelectColumn} FROM \`${TableName}\`${selectParentAs} ${UpdateWhere} \n ${SelectOrderBy} ${SelectLimit}`;
                    this.mMethod = "READ";
                    await this.rawQuerySync<CallbackSelect>(mSQL,[])
                        .then(async (result) => {
                            await resolve(result);
                        })
                        .catch(async (error) => {
                            await rejected(<CallbackError>error);
                        })
                }
            }else{
                const mSQL = `SELECT * FROM \`${TableName}\` `;
                this.mMethod = "READ";
                await this.rawQuerySync<CallbackSelect>(mSQL,[])
                    .then(async (result) => {
                        await resolve(result);
                    })
                    .catch(async (error) => {
                        await rejected(<CallbackError>error);
                    })
            }
        })



    };

    /**
     * @name Select
     */
    Baca = this.Select;
    Lihat = this.Select;

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesUpdate} Rules - <b>Rules</b><br/>
     * The Rules is Parameter Options For Update <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackUpdate | CallbackError> - <b>Promise<CallbackUpdate | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Update(TableName : string, Rules : RulesUpdate) : Promise<CallbackUpdate> {
        this.timeStart = new Date().getTime();
        /** Merge JSON Extend loDash **/
        const Rule = extend({
            data: false,
            search: false
        }, Rules);

        this.mKey = [];
        this.mWhere = [];

        return new Promise(async (resolve, rejected) => {
            Object.keys(Rule.data).forEach((key) => {
                this.mKey.push(` ${key} = '${Rule.data[key]}'`);
            });

            Object.keys(Rule.search).forEach((key) => {
                this.mWhere.push(`${key} = '${Rule.search[key]}'`);
            });

            const UpdateWhere = (Rule.search !== false) ? `WHERE ${this.mWhere}` : ``;

            const mSQL = `UPDATE \`${TableName}\` SET${this.mKey} ${UpdateWhere} `;
            this.mMethod = "UPDATE";
            await this.rawQuerySync<CallbackUpdate>(mSQL, [])
                .then(async (result) => {
                    await resolve(result);
                })
                .catch(async (error) => {
                    await rejected(<CallbackError>error);
                })

        })
    }

    /**
     * @name Update
     */
    Edit = this.Update;
    Ubah = this.Update;

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesDelete} Rules - <b>Rules</b><br/>
     * The Rules is Parameter Options For Delete <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackDelete | CallbackError> - <b>Promise<CallbackDelete | CallbackError></b><br/>
     * The Return Variable Format
     */

    async Delete (TableName : string , Rules : RulesDelete) : Promise<CallbackDelete>{

        const Rule = extend({
            search: false
        }, Rules);

        this.mWhere = [];

        return new Promise(async (resolve, rejected) => {
            Object.keys(Rule.search).forEach((key) => {
                this.mWhere.push(` \`${key}\` = "${Rule.search[key]}" `)
            });

            const DeleteWhere = (Rule.search !== false) ? `WHERE ${this.mWhere}` : ``;

            const SqlScript = `DELETE FROM \`${TableName}\` ${DeleteWhere} `;
            this.mMethod = "DELETE";
            await this.rawQuerySync<CallbackDelete>(SqlScript, [])
                .then(async (result) => {
                    await resolve(result)
                })
                .catch(async (error) => {
                    await rejected(<CallbackError>error);
                })

        })
    };

    /**
     * @name Delete
     */
    Remove = this.Delete;
    Hapus = this.Delete;

    /**
     *
     * @param {string} SQLString
     * @param {any}values
     * @param ExtendsOptions
     */
    async rawQuerySync<T>(SQLString : string, values?: any, ExtendsOptions ?: ExtendsOptions): Promise<T> {
        return new Promise(async (resolve, rejected) => {
            switch (this.mConfig.engine) {
                case "Connection":
                    let mInstanceConnection = await (this.mInstance as Promise<Connection>);
                    await rejected({
                        status: false,
                        code: 500,
                        msg: `function now unavailable`
                    });
                    break;
                case "PoolConnection":
                    let mInstancePool = (this.mInstance as Pool);
                    mInstancePool.getConnection()
                        .then(async (PoolConnection) => {
                            //Start After Get Connection
                            await PoolConnection.query(SQLString, values)
                                .then(async (rows) => {
                                    let timeEnd = new Date().getTime();
                                    let metadata: metadata = {
                                        activeConnections: mInstancePool.activeConnections(),
                                        idleConnections: mInstancePool.idleConnections(),
                                        totalConnections: mInstancePool.totalConnections(),
                                        lastInsertId : undefined,
                                        sqlRaw: SQLString,
                                        timeExecuteinMilliSecond: Math.round(timeEnd - this.timeStart),
                                        timeExecuteinSecond: ((timeEnd - this.timeStart) / 1000)
                                    }
                                    switch (this.mMethod) {
                                        case "CREATE_DB" :
                                            let mIfNotExistDB = (ExtendsOptions !== undefined && ExtendsOptions.ifNotExist) ? ExtendsOptions.ifNotExist : false;
                                            if (rows.warningStatus < 1 || mIfNotExistDB) {
                                                await resolve(<T>{
                                                    status: true,
                                                    code: 200,
                                                    msg: `successful, your database has been created`,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }else{
                                                await rejected({
                                                    status: false,
                                                    code: 201,
                                                    msg: `warning status detected. Check Warning Message`,
                                                    affected : rows.affectedRows,
                                                    warning : rows.warningStatus,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }

                                            break;
                                        case "CREATE_TABLE" :
                                            let mIfNotExist = (ExtendsOptions !== undefined && ExtendsOptions.ifNotExist) ? ExtendsOptions.ifNotExist : false;
                                            if (rows.warningStatus < 1 || mIfNotExist) {
                                                await resolve(<T>{
                                                    status: true,
                                                    code: 200,
                                                    msg: `successful, your table has been created`,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }else{
                                                await rejected({
                                                    status: false,
                                                    code: 201,
                                                    msg: `warning status detected. Check Warning Message`,
                                                    affected : rows.affectedRows,
                                                    warning : rows.warningStatus,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }

                                            break;
                                        case "INSERT":
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1) {
                                                    metadata = await merge(metadata, { lastInsertId : rows.insertId });
                                                    await resolve(<T>{
                                                        status: true,
                                                        code: 200,
                                                        msg: `successful, your data has been created`,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                } else {
                                                    await rejected({
                                                        status: false,
                                                        code: 201,
                                                        msg: `warning status detected. Check Warning Message`,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                }
                                            } else {
                                                await rejected({
                                                    status: false,
                                                    code: 404,
                                                    msg: `Succeeded, But No Data Changed Created`,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }
                                            break;
                                        case "READ":
                                            if (rows.length > 0) {
                                                if (ExtendsOptions?.encryption !== undefined){
                                                    if (MariaDB.checkModuleExist("@dkaframework/encryption")) {
                                                        let mEncryption = require("@dkaframework/encryption").default;
                                                        let mEncryptInst = await new mEncryption(ExtendsOptions.encryption);
                                                        let mFinalRows : any[] = [];
                                                        await rows.map(async (data : any) =>{
                                                            let mJSONData : any = {};
                                                            await Object.keys(data).forEach( function (key) {
                                                                let mKey = (ExtendsOptions.settings?.coloumn) ?
                                                                    mEncryptInst.decodeIvSync(key) : key;
                                                                let mVal = (ExtendsOptions.settings?.rows && typeof data[key] !== "number") ?
                                                                    mEncryptInst.decodeIvSync(data[key]) : data[key];
                                                                mJSONData[mKey] = mVal;
                                                            });
                                                            mFinalRows.push(mJSONData);
                                                        });
                                                        await resolve(<T>{
                                                            status: true,
                                                            code: 200,
                                                            msg: `successful, your data has been read`,
                                                            data: mFinalRows,
                                                            metadata: metadata
                                                        });
                                                        await PoolConnection.release();
                                                    }else{
                                                        await rejected({ status : false, code : 500, msg : `Encryption Module is Declare. but module not installed, please installed first "@dkaframework/encryption" `});
                                                        await PoolConnection.release();
                                                    }
                                                }else{
                                                    await resolve(<T>{
                                                        status: true,
                                                        code: 200,
                                                        msg: `successful, your data has been read`,
                                                        data: rows,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                }

                                            } else {
                                                await rejected({
                                                    status: false,
                                                    code: 404,
                                                    msg: `Succeeded, But No Data Found`,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }
                                            break;
                                        case "UPDATE" :
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1) {
                                                    await resolve(<T>{
                                                        status: true,
                                                        code: 200,
                                                        msg: `successful, your data has been update`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                } else {
                                                    await rejected({
                                                        status: false,
                                                        code: 201,
                                                        msg: `warning status detected. Check Warning Message`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                }
                                            } else {
                                                await rejected({
                                                    status: false,
                                                    code: 404,
                                                    msg: `Succeeded, But No Data Changed`,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }
                                            break;
                                        case "DELETE" :
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1) {
                                                    await resolve(<T>{
                                                        status: true,
                                                        code: 200,
                                                        msg: `successful, your data has been delete`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                } else {
                                                    await rejected({
                                                        status: false,
                                                        code: 201,
                                                        msg: `warning status detected. Check Warning Message`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    });
                                                    await PoolConnection.release();
                                                }
                                            } else {
                                                await rejected({
                                                    status: false,
                                                    code: 404,
                                                    msg: `Succeeded, But No Data Changed`,
                                                    metadata: metadata
                                                });
                                                await PoolConnection.release();
                                            }
                                            break;
                                        default:
                                            this.timeStart = new Date().getTime();
                                            await rejected({
                                                status: false,
                                                code: 505,
                                                msg: `Method Unknown`,
                                                metadata: metadata
                                            });
                                            await PoolConnection.release();
                                            break;
                                    }

                                })
                                .catch(async (error) => {
                                    let timeEnd = new Date().getTime();
                                    let metadata: metadata = {
                                        activeConnections: mInstancePool.activeConnections(),
                                        idleConnections: mInstancePool.idleConnections(),
                                        totalConnections: mInstancePool.totalConnections(),
                                        sqlRaw: SQLString,
                                        timeExecuteinMilliSecond: Math.round(timeEnd - this.timeStart),
                                        timeExecuteinSecond: ((timeEnd - this.timeStart) / 1000)
                                    }
                                    switch (error.code) {
                                        case 'ER_TABLE_EXISTS_ERROR' :
                                            await rejected({
                                                status: false,
                                                code: 500,
                                                msg: "Failed, Table Name Is Exists",
                                                metadata : metadata,
                                                error: {
                                                    errorMsg: error.text,
                                                    errorCode: error.code,
                                                    errNo: error.errno
                                                }
                                            });
                                            await PoolConnection.release();
                                            break;
                                        case "ER_NO_SUCH_TABLE" :
                                            if (ExtendsOptions?.encryption !== undefined){
                                                await rejected({
                                                    status: false,
                                                    code: 500,
                                                    msg: "Error Detected, cannot find encryption variable table name",
                                                    metadata : metadata,
                                                    error: {
                                                        errorMsg: error.text,
                                                        errorCode: error.code,
                                                        errNo: error.errno
                                                    }
                                                });
                                            }else{
                                                await rejected({
                                                    status: false,
                                                    code: 500,
                                                    msg: "Error Detected",
                                                    metadata : metadata,
                                                    error: {
                                                        errorMsg: error.text,
                                                        errorCode: error.code,
                                                        errNo: error.errno
                                                    }
                                                });
                                            }
                                            await PoolConnection.release();
                                            break;
                                        default :
                                            await rejected({
                                                status: false,
                                                code: 500,
                                                msg: "Error Detected",
                                                metadata : metadata,
                                                error: {
                                                    errorMsg: error.text,
                                                    errorCode: error.code,
                                                    errNo: error.errno
                                                }
                                            });
                                            await PoolConnection.release();
                                    }
                                });
                            //End After Get Connection
                        })
                        .catch(async (error) => {
                            switch (error.code) {
                                case "ER_GET_CONNECTION_TIMEOUT" :
                                    await rejected({
                                        status: false,
                                        code: 500,
                                        msg: `Pool Connection get connection Error`,
                                        error: {
                                            errorMsg: error.text,
                                            errorCode: error.code,
                                            errNo: error.errno
                                        }
                                    });
                                    break;
                                default :
                                    await rejected({
                                        status: false,
                                        code: 500,
                                        msg: `Pool Connection get connection Error`,
                                        error: {
                                            errorMsg: error.text,
                                            errorCode: error.code,
                                            errNo: error.errno
                                        }
                                    });
                                    break;
                            }
                        });
                    break;
                case "PoolClusterConnection":
                    await rejected({
                        status: false,
                        code: 500,
                        msg: `function now unavailable`
                    });
                    break;
                default:
                    this.mInstance = undefined;
                    break;
            }
        });

    }

    /**
     * @name rawQuerySync
     */
    Query = this.rawQuerySync;

    async AutoBackup(enabled : Boolean = true) : Promise<CallbackBackup> {
        return new Promise(async (resolve, rejected) => {
            if (enabled){
                if (MariaDB.checkModuleExist("mysqldump")){
                    const mysqlDump = require("mysqldump").default;
                    const fs = require("fs");
                    let AddPathByTimes = ``;
                    let renameFile = ``;
                    let renameFileChecksum = ``;
                    let nameCompressed = ``;
                    let reformatNameTimes = ``;

                    let fileBuffer : Buffer;
                    let hashSum : crypto.Hash;
                    let checksumHex : string | undefined = undefined;
                    switch (this.mConfig.autoBackup?.backupPriodic) {
                        case "HOURS" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Hours');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }
                            reformatNameTimes = moment().format("dddd_HH_DD-MM-YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;
                            break;
                        case "DAILY" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Daily');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }

                            reformatNameTimes = moment().format("dddd_DD-MM-YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;
                            break;
                        case "MONTH" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Month');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }

                            reformatNameTimes = moment().format("MM-YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;
                            break;
                        case "YEARS" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Years');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }

                            reformatNameTimes = moment().format("YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;

                            break;
                        default :
                            await rejected({
                                status : false,
                                code : 500,
                                msg : `Method Unknown or Not Available`
                            });
                            break;
                    }

                    if (!fs.existsSync(renameFile) || this.mConfig.autoBackup?.forceReplace){
                        await mysqlDump({
                            connection : {
                                host : this.mConfig.host,
                                user : this.mConfig.user,
                                password : this.mConfig.password,
                                port : this.mConfig.port,
                                database : this.mConfig.database
                            },
                            dumpToFile : renameFile,
                            compressFile : this.mConfig.autoBackup?.compressFile
                        }).then(async (dumpReturn: DumpReturn) => {
                            /** Generate Hex Checksum Of File Backup **/
                            fileBuffer = fs.readFileSync(renameFile);
                            hashSum = crypto.createHash('sha256');
                            await hashSum.update(fileBuffer);
                            checksumHex = hashSum.digest('hex');
                            await fs.writeFileSync(renameFileChecksum, `checksum=${checksumHex}`);
                            /** End Generate Hex Checksum Of File Backup **/
                            let timeEnd = new Date().getTime();

                            resolve({
                                status : true,
                                code : 200,
                                msg : `successfully to Backup Database`,
                                filename : renameFile,
                                checksum : checksumHex
                            })
                        }).catch(async (error : CallbackError) => {
                            await rejected({
                                status : false,
                                code : 500,
                                msg : `Failed to Backup Database Schedule.`,
                                error : {
                                    errorMsg : ``
                                },
                                errorEx : error
                            })
                        })
                    }else{
                        /** Generate Hex Checksum Of File Backup **/
                        fileBuffer = fs.readFileSync(renameFile);
                        hashSum = crypto.createHash('sha256');
                        await hashSum.update(fileBuffer);
                        checksumHex = hashSum.digest('hex');
                        await fs.writeFileSync(renameFileChecksum, `checksum=${checksumHex}`);
                        /** End Generate Hex Checksum Of File Backup **/

                        await resolve({
                            status : true,
                            code : 301,
                            msg : `Sucessfully. But backup is Exist. Backup Action Skipped`,
                            filename : renameFile,
                            checksum : checksumHex
                        })
                    }
                }else{
                    await rejected({
                        status : false,
                        code : 500,
                        msg : `MODULE "mysqldump" not Installed. please install First`
                    });
                }
            }else{
                await rejected({
                    status : false,
                    code : 500,
                    msg : `Auto Backup Disable. to use it please enabled first`
                });
            }
        })
    }
}

export default MariaDB;
export { MariaDB };
