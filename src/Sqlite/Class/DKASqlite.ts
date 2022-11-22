
import {DKASqliteImplementationClass, SqliteFunctionConfiguration} from "../Interfaces/Class";
import {
    OptionsCreateTableDKASqlite,
    OptionsDeleteDKASqlite,
    OptionsInsertDKASqlite,
    OptionsSelectDKASqlite
} from "../Interfaces/Method";
import {extend, isArray, isObject, isString, merge} from "lodash";
import {CreateTableCallback, DeleteCallback, InsertCallback, SelectCallback} from "../Interfaces/Callback";
import {RulesInsert} from "../../MariaDB/Interfaces/Class";
import {InsertDataConfig} from "../../MariaDB/Config";
import {default as mEncryption} from "@dkaframework/encryption";
import { Database } from "@journeyapps/sqlcipher";
import {CallbackError} from "../../MariaDB/Interfaces/Callback";


export class DKASqlite extends Database implements DKASqliteImplementationClass {
    get mSearchAdd(): string | undefined {
        return this._mSearchAdd;
    }

    set mSearchAdd(value: string | undefined) {
        this._mSearchAdd = value;
    }
    get SqlScript(): string {
        return this._SqlScript;
    }

    set SqlScript(value: string) {
        this._SqlScript = value;
    }
    get keySecret() : string | undefined {
        return this._keySecret;
    }

    set keySecret(value: string | undefined) {
        this._keySecret = value;
    }

    private _mKey : any[] = [];
    private _mVal : any[] = [];
    private _mSetData : any[] = [];
    private _mWhere : any[] = [];
    private _keySecret ?: string = undefined;

    private _SqlScript : string = "";
    private _mSearchAdd : string | undefined;


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
    get mSetData(): any[] {
        return this._mSetData;
    }
    set mSetData(value: any[]) {
        this._mSetData = value;
    }
    get mWhere(): any[] {
        return this._mWhere;
    }
    set mWhere(value: any[]) {
        this._mWhere = value;
    }

    constructor(filename: string, mode?: number, key ?: string | undefined, first ?: boolean, callback?: (err: Error | null) => void) {
        super(filename,mode, callback);
        this.keySecret = key;
        if (this.keySecret !== undefined){
            this.serialize(async () => {
                // This is the default, but it is good to specify explicitly:
                this.run("PRAGMA cipher_compatibility = 4");
                this.run(`PRAGMA key = '${this.keySecret}'`);
                if (first){
                    await this.run(`CREATE TABLE __dka_test__ ( id INT PRIMARY_KEY, user TEXT NOT NULL)`,[], async (error) => {
                        await this.run(`INSERT INTO __dka_test__ (id, user) VALUES (1,"Halo")`,[], async (error)=> {

                        })
                    })
                }
            });
        }else{
            if (first){
                    this.run(`CREATE TABLE __dka_test__ ( id INT PRIMARY_KEY, user TEXT NOT NULL)`,[], async (error) => {
                    await this.run(`INSERT INTO __dka_test__ (id, user) VALUES (1,"Halo")`,[], async (error)=> {

                    })
                })
            }
        }
    }


    async CreateTable(tableName : string, CreateTableOptions : OptionsCreateTableDKASqlite) : Promise<CreateTableCallback> {

        let mRules : OptionsCreateTableDKASqlite = CreateTableOptions;

        let mQuery = ``;
        let mFinalQuery = ``;
        let length : number;
        let mDefault : string;

        return new Promise(async (resolve, rejected) => {
            mRules.data.forEach((value) => {
                switch (value.type) {
                    case "INT" :
                        let autoIncrement = (value.autoIncrement !== undefined && value.autoIncrement) ? "AUTO_INCREMENT" : "";
                        mQuery += ` \`${value.coloumn}\` INT ${autoIncrement}`;
                        break;
                    case "TEXT" :
                        mDefault = (value.default === null) ? `DEFAULT NULL` : `NOT NULL`;
                        mQuery += ` \`${value.coloumn}\` TEXT ${mDefault}`;
                        break;

                }
                mQuery += `,`;
            });
            /** Remove (,) in last statment **/
            mQuery = mQuery.substring(0, mQuery.length - 1);
            let mIfNotExists = (mRules.ifNotExist === true) ? `IF NOT EXISTS ` : ``;
            this.SqlScript = `CREATE TABLE ${mIfNotExists}\`${tableName}\`(${mQuery});`;
            if (this.keySecret !== undefined){
                await this.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    this.run("PRAGMA cipher_compatibility = 4");
                    this.run(`PRAGMA key = '${this.keySecret}'`);
                    await this.run(this.SqlScript,[], async (error) => {
                        if (!error){
                            await resolve({ status : true, code : 200, msg : `Successfully, Created Table`})
                        }else{
                            await rejected({ status : false, code : 500, msg : `Failed, Created Table `, error : error})
                        }
                    })
                })
            }else{
                await this.run(this.SqlScript,[], async (error) => {
                    if (!error){
                        await resolve({ status : true, code : 200, msg : `Successfully, Created Table`})
                    }else{
                        await rejected({ status : false, code : 500, msg : `Failed, Created Table `, error : error})
                    }
                })
            }



        })
    }
    async Insert(tableName : string = "__dka_test__", InsertOptions : OptionsInsertDKASqlite) : Promise<InsertCallback> {

        let Rules : RulesInsert = InsertOptions;

        return new Promise(async (resolve, rejected) => {
            if (Rules.data.isObject){
                /** Truncate Variable **/
                this.mKey = [];
                this.mVal = [];
                /** Object Looping While **/
                await Object.keys(Rules.data).forEach((key : string) => {
                    this.mKey.push(` \`${key}\` `);
                    this.mVal.push(`"${Rules.data?.[key]}"`);
                });

                this.SqlScript = `INSERT INTO \`${tableName}\` (${this.mKey})VALUES (${this.mVal}) `;
                if (this.keySecret !== undefined){
                    await this.serialize(async () => {
                        // This is the default, but it is good to specify explicitly:
                        this.run("PRAGMA cipher_compatibility = 4");
                        this.run(`PRAGMA key = '${this.keySecret}'`);
                        await this.run(this.SqlScript,[], async (error) => {
                            if (!error){
                                await resolve(
                                    {
                                        status : true,
                                        code : 200,
                                        msg : `Successfully, Created Data`,
                                        metadata : {
                                            rawSql : this.SqlScript
                                        }
                                    })
                            }else{
                                await rejected({ status : false, code : 500, msg : `Failed, Created Data`, error : error})
                            }
                        })
                    })
                }else{
                    await this.run(this.SqlScript,[], async (error) => {
                        if (!error){
                            await resolve(
                                {
                                    status : true,
                                    code : 200,
                                    msg : `Successfully, Created Data`,
                                    metadata : {
                                        rawSql : this.SqlScript
                                    }
                                })
                        }else{
                            await rejected({ status : false, code : 500, msg : `Failed, Created Data`, error : error})
                        }
                    })
                }

                console.log("isObject")
            }else if (Rules.data instanceof Array === true){

                //@@@@@@@@@@@@@@@@@@@
                this.mVal = [];
                this.mKey = [];
                this.mSetData = [];
                //@@@@@@@@@@@@@@@@@@@

                //**********************************************************
                Rules.data.map(async (item : object, index : number) => {
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
                this.SqlScript = `INSERT INTO ${tableName} (${this.mKey})VALUES ${this.mVal} `;
                if (this.keySecret !== undefined){
                    await this.serialize(async () => {
                        // This is the default, but it is good to specify explicitly:
                        this.run("PRAGMA cipher_compatibility = 4");
                        this.run(`PRAGMA key = '${this.keySecret}'`);
                        await this.run(this.SqlScript,[], async (error) => {
                            if (!error){
                                await resolve(
                                    {
                                        status : true,
                                        code : 200,
                                        msg : `Successfully, Created Data`,
                                        metadata : {
                                            rawSql : this.SqlScript
                                        }
                                    })
                            }else{
                                await rejected({ status : false, code : 500, msg : `Failed, Created Data`, sqlRaw : this.SqlScript, error : error})
                            }
                        })
                    })
                }else{
                    await this.run(this.SqlScript,[], async (error) => {
                        if (!error){
                            await resolve(
                                {
                                    status : true,
                                    code : 200,
                                    msg : `Successfully, Created Data`,
                                    metadata : {
                                        rawSql : this.SqlScript
                                    }
                                })
                        }else{
                            await rejected({ status : false, code : 500, msg : `Failed, Created Data`, sqlRaw : this.SqlScript, error : error})
                        }
                    })
                }
            }
        })
    }

    async Select(tableName : string = "__dka_test__", SelectOptions ?: OptionsSelectDKASqlite) : Promise<SelectCallback> {
        this.mSearchAdd = ``;
        let checkJoin : Promise<string> = new Promise(async (resolve, rejected) => {
            let innerType = ``;
            let On = ``;
            if (SelectOptions?.join !== undefined){
                if(SelectOptions?.as !== undefined){
                    if (Array.isArray(SelectOptions?.join)){
                        SelectOptions?.join.map(async (SelectJoin) => {
                            let mSelectJoinMode = (SelectJoin.mode !== undefined) ? `${SelectJoin.mode} ` : ``;
                            let joinAliasTableName = (SelectJoin.as !== undefined) ? `AS \`${SelectJoin.as}\`` : ``;
                            if (SelectJoin.on !== undefined){
                                if (SelectJoin.on.collNameFirst.tableAlias !== undefined){
                                    On = ` ON \`${SelectJoin.on.collNameFirst.tableAlias}\`.\`${SelectJoin.on.collNameFirst.collName}\` = \`${SelectJoin.on.collNameSecond.tableAlias}\`.\`${SelectJoin.on.collNameSecond.collName}\` `;
                                }else {
                                    On = ` ON \`${SelectOptions?.as}\`.\`${SelectJoin.on.collNameFirst.collName}\` = \`${SelectJoin.on.collNameSecond.tableAlias}\`.\`${SelectJoin.on.collNameSecond.collName}\` `;
                                }
                            }else{
                                On = ``;
                            }
                            innerType += `${mSelectJoinMode}JOIN \`${SelectJoin.TableName}\` ${joinAliasTableName} ${On}`;
                        })
                    }else if (typeof SelectOptions?.join === "object"){

                        let mSelectJoinMode = (SelectOptions?.join.mode !== undefined) ? `${SelectOptions?.join.mode} ` : ``;
                        let joinAliasTableName = (SelectOptions?.join.as !== undefined) ? `AS \`${SelectOptions?.join.as}\`` : ``;
                        if (SelectOptions?.join.on !== undefined){
                            if (SelectOptions?.join.on.collNameFirst.tableAlias !== undefined){
                                On = ` ON \`${SelectOptions?.join.on.collNameFirst.tableAlias}\`.\`${SelectOptions?.join.on.collNameFirst.collName}\` = \`${SelectOptions?.join.on.collNameSecond.tableAlias}\`.\`${SelectOptions?.join.on.collNameSecond.collName}\` `;
                            }else {
                                On = ` ON \`${SelectOptions?.as}\`.\`${SelectOptions?.join.on.collNameFirst.collName}\` = \`${SelectOptions?.join.on.collNameSecond.tableAlias}\`.\`${SelectOptions?.join.on.collNameSecond.collName}\` `;
                            }
                        }else{
                            On = ``;
                        }

                        innerType += `${mSelectJoinMode}JOIN \`${SelectOptions?.join.TableName}\` ${joinAliasTableName} ${On}`;
                        console.log(innerType)
                    }
                    await resolve(innerType)
                }else{
                    await rejected({ status : false, code : 500, msg : `join mode is exist. but parent as not set. please set first`} as CallbackError)
                }
            }else{
                resolve(``)
            }
        })
        return new Promise(async (resolve, rejected) => {

            if (Array.isArray(SelectOptions?.search)){

                await SelectOptions?.search.forEach((item  ) => {
                    if (typeof item === "object"){
                        let mCondition = (item.condition !== undefined) ? item.condition : `=`;
                        this.mSearchAdd += `\`${item.coloumName}\` ${mCondition} \'${item.data}\'`;
                    }else if(isString(item)){
                        this.mSearchAdd += ` ${item} `;
                    }
                });
            }else if (typeof SelectOptions?.search === "object"){
                let mCondition = (SelectOptions?.search.condition !== undefined) ? SelectOptions?.search.condition : `=`;
                this.mSearchAdd += `\`${SelectOptions?.search.coloumName}\` ${mCondition} '${SelectOptions?.search.data}' `;
            }
            const UpdateWhere = (SelectOptions?.search !== undefined) ? ` WHERE ${this.mSearchAdd} ` : ``;
            const selectParentAs = (SelectOptions?.as !== undefined && SelectOptions?.as !== false) ? ` AS \`${SelectOptions?.as}\` ` : ` `;
            let mColumn = (SelectOptions?.column !== undefined) ? SelectOptions.column : "*";
            await checkJoin
                .then(async (innerType) => {
                    this.SqlScript = `SELECT ROWID as id, ${mColumn} FROM \`${tableName}\`${selectParentAs}${innerType}${UpdateWhere}`;
                    if (this.keySecret !== undefined){
                        await this.serialize(async () => {
                            // This is the default, but it is good to specify explicitly:
                            this.run("PRAGMA cipher_compatibility = 4");
                            this.run(`PRAGMA key = '${this.keySecret}'`);
                            this.all(this.SqlScript,[], async (error, row) => {
                                if (!error){
                                    if (row.length > 0){
                                        await resolve({
                                            status : true,
                                            code : 200,
                                            msg : `Successfully, getting data is success`,
                                            data : row,
                                            metadata : {
                                                rawSql : this.SqlScript
                                            }
                                        })
                                    }else{
                                        await rejected({ status : false, code : 404, msg : `Successfully. but not data found`})
                                    }
                                }else{
                                    await rejected({
                                        status : false,
                                        code : 500, msg : `Failed, select data is not success`,
                                        error : error,
                                        metadata : {
                                            rawSql : this.SqlScript
                                        }
                                    });
                                }
                            })
                        })
                    }else{
                        this.all(this.SqlScript,[], async (error, row) => {
                            if (!error){
                                if (row.length > 0){
                                    await resolve({
                                        status : true,
                                        code : 200,
                                        msg : `Successfully, getting data is success`,
                                        data : row,
                                        metadata : {
                                            rawSql : this.SqlScript
                                        }
                                    })
                                }else{
                                    await rejected({
                                        status : false,
                                        code : 404,
                                        msg : `Successfully. but not data found`,
                                        metadata : {
                                            rawSql : this.SqlScript
                                        }
                                    })
                                }
                            }else{
                                await rejected({
                                    status : false,
                                    code : 500,
                                    msg : `Failed, select data is not success`,
                                    error : error,
                                    metadata : {
                                        rawSql : this.SqlScript
                                    }
                                })
                            }
                        })
                    }
                })
                .catch(async (error) => {
                    await rejected(error)
                });

        })
    }

    async Delete(tableName: string, DeleteOptions ?: OptionsDeleteDKASqlite): Promise<DeleteCallback> {
        const Rules : OptionsDeleteDKASqlite = merge({

        },DeleteOptions);

        this.mWhere = [];

        return new Promise(async (resolve, rejected) => {
            if (Rules.search !== undefined){
                Object.keys(Rules.search).forEach((key) => {
                    if (key !== "_rowId_"){
                        // @ts-ignore
                        this.mWhere.push(`\`${key}\`= "${Rules.search?.[key]}" `)
                    }else{
                        if (Rules.search !== undefined){
                            this.mWhere.push(` ROWID=${Rules.search._rowId_}`)
                        }
                    }

                });
            }
            const DeleteWhere = (Rules.search !== undefined) ? `WHERE ${this.mWhere}` : ``;
            this.SqlScript = `DELETE FROM \`${tableName}\` ${DeleteWhere} `;

            if (this.keySecret !== undefined){
                await this.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    this.run("PRAGMA cipher_compatibility = 4");
                    this.run(`PRAGMA key = '${this.keySecret}'`);
                    this.run(this.SqlScript,function (error) {
                        if (!error){
                            if (Rules.bypassChange === true){
                                resolve({ status : true, code : 200, msg : `Successfully, Delete Data`})
                            }else{
                                if (this.changes > 0){
                                    resolve({ status : true, code : 200, msg : `Successfully, Delete Data`})
                                }else{
                                    rejected({ status : false, code : 500, msg : `Failed, Data Search Not Found or Not Exist`})
                                }
                            }

                        }else{
                            rejected({ status : false, code : 500, msg : `Failed, Delete Data`, error : error})
                        }
                    })
                });
            }else{
                this.run(this.SqlScript,function (error) {
                    if (!error){
                        if (this.changes > 0){
                            resolve({ status : true, code : 200, msg : `Successfully, Delete Data`})
                        }else{
                            rejected({ status : false, code : 500, msg : `Failed, Data Search Not Found or Not Exist`})
                        }
                    }else{
                        rejected({ status : false, code : 500, msg : `Failed, Delete Data`, error : error})
                    }
                })
            }

        });
    }


}

export default DKASqlite;