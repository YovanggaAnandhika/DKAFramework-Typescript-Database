
import {DKASqliteImplementationClass, SqliteFunctionConfiguration} from "../Interfaces/Class";
import {
    OptionsCreateTableDKASqlite,
    OptionsDeleteDKASqlite,
    OptionsInsertDKASqlite,
    OptionsSelectDKASqlite
} from "../Interfaces/Method";
import {extend, isArray, isObject, merge} from "lodash";
import {CreateTableCallback, DeleteCallback, InsertCallback, SelectCallback} from "../Interfaces/Callback";
import {RulesInsert} from "../../MariaDB/Interfaces/Class";
import {InsertDataConfig} from "../../MariaDB/Config";
import {default as mEncryption} from "@dkaframework/encryption";
import { Database } from "@journeyapps/sqlcipher";


export class DKASqlite extends Database implements DKASqliteImplementationClass {
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

    private SqlScript : string = "";


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
                        let autoIncrement = (value.autoIncrement) ? "AUTO_INCREMENT" : "";
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

            this.SqlScript = `CREATE TABLE \`${tableName}\`(${mQuery});`;
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
            if (isObject(Rules.data)){
                /** Truncate Variable **/
                this.mKey = [];
                this.mVal = [];
                /** Object Looping While **/
                await Object.keys(Rules.data).forEach((key : string) => {
                    this.mKey.push(` \`${key}\` `);
                    this.mVal.push(`"${Rules.data?.[key]}"`);
                });

                this.SqlScript = `INSERT INTO \`${tableName}\` (${this.mKey}) VALUES (${this.mVal}) `;
                if (this.keySecret !== undefined){
                    await this.serialize(async () => {
                        // This is the default, but it is good to specify explicitly:
                        this.run("PRAGMA cipher_compatibility = 4");
                        this.run(`PRAGMA key = '${this.keySecret}'`);
                        await this.run(this.SqlScript,[], async (error) => {
                            if (!error){
                                await resolve({ status : true, code : 200, msg : `Successfully, Created Data`})
                            }else{
                                await rejected({ status : false, code : 500, msg : `Failed, Created Data`, error : error})
                            }
                        })
                    })
                }else{
                    await this.run(this.SqlScript,[], async (error) => {
                        if (!error){
                            await resolve({ status : true, code : 200, msg : `Successfully, Created Data`})
                        }else{
                            await rejected({ status : false, code : 500, msg : `Failed, Created Data`, error : error})
                        }
                    })
                }


            }else if (Array.isArray(Rules.data)){

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
                this.SqlScript = `INSERT INTO ${tableName} (${this.mKey}) VALUES ${this.mVal} `;
                if (this.keySecret !== undefined){
                    await this.serialize(async () => {
                        // This is the default, but it is good to specify explicitly:
                        this.run("PRAGMA cipher_compatibility = 4");
                        this.run(`PRAGMA key = '${this.keySecret}'`);
                        await this.run(this.SqlScript,[], async (error) => {
                            if (!error){
                                await resolve({ status : true, code : 200, msg : `Successfully, Created Data`})
                            }else{
                                await rejected({ status : false, code : 500, msg : `Failed, Created Data`, error : error})
                            }
                        })
                    })
                }else{
                    await this.run(this.SqlScript,[], async (error) => {
                        if (!error){
                            await resolve({ status : true, code : 200, msg : `Successfully, Created Data`})
                        }else{
                            await rejected({ status : false, code : 500, msg : `Failed, Created Data`, error : error})
                        }
                    })
                }
            }
        })
    }

    async Select(tableName : string = "__dka_test__", SelectOptions ?: OptionsSelectDKASqlite) : Promise<SelectCallback> {

        return new Promise(async (resolve, rejected) => {
            let mColumn = (SelectOptions?.column !== undefined) ? SelectOptions.column : "*"
            this.SqlScript = `SELECT ROWID as id, ${mColumn} FROM ${tableName}`

            if (this.keySecret !== undefined){
                await this.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    this.run("PRAGMA cipher_compatibility = 4");
                    this.run(`PRAGMA key = '${this.keySecret}'`);
                    this.all(this.SqlScript,[], async (error, row) => {
                        if (!error){
                            if (row.length > 0){
                                await resolve({ status : true, code : 200, msg : `Successfully, getting data is success`, data : row})
                            }else{
                                await rejected({ status : false, code : 404, msg : `Successfully. but not data found`})
                            }
                        }else{
                            await rejected({ status : false, code : 500, msg : `Failed, select data is not success`, error : error})
                        }
                    })
                })
            }else{
                this.all(this.SqlScript,[], async (error, row) => {
                    if (!error){
                        if (row.length > 0){
                            await resolve({ status : true, code : 200, msg : `Successfully, getting data is success`, data : row})
                        }else{
                            await rejected({ status : false, code : 404, msg : `Successfully. but not data found`})
                        }
                    }else{
                        await rejected({ status : false, code : 500, msg : `Failed, select data is not success`, error : error})
                    }
                })
            }

        })
    }

    async Delete(tableName: string, DeleteOptions : OptionsDeleteDKASqlite): Promise<DeleteCallback> {
        const Rules : OptionsDeleteDKASqlite = DeleteOptions;

        this.mWhere = [];
        return new Promise(async (resolve, rejected) => {
            Object.keys(Rules.search).forEach((key) => {
                if (key !== "_rowId_"){
                    // @ts-ignore
                    this.mWhere.push(`\`${key}\`= "${Rules.search?.[key]}" `)
                }else{
                    this.mWhere.push(` ROWID=${Rules.search._rowId_}`)
                }

            });
            const DeleteWhere = (Rules.search !== undefined) ? `WHERE ${this.mWhere}` : ``;
            this.SqlScript = `DELETE FROM \`${tableName}\` ${DeleteWhere} `;

            if (this.keySecret !== undefined){
                await this.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    this.run("PRAGMA cipher_compatibility = 4");
                    this.run(`PRAGMA key = '${this.keySecret}'`);
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