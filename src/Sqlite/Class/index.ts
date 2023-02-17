import {SqliteFunctionConfiguration} from "../Interfaces/Class";
import Databases, {Database, OPEN_READWRITE} from "@journeyapps/sqlcipher";
import Security from "@dkaframework/encryption";
import {
    OptionsCreateTableDKASqlite,
    OptionsDeleteDKASqlite,
    OptionsInsertDKASqlite,
    OptionsSelectDKASqlite
} from "../Interfaces/Method";
import {CreateTableCallback, DeleteCallback, InsertCallback, SelectCallback} from "../Interfaces/Callback";
import {RulesInsert} from "../../MariaDB/Interfaces/Class";
import {CallbackError} from "../../MariaDB/Interfaces/Callback";
import {isString, merge} from "lodash";
import fs from "fs";

export class DB {

    protected db: Database | undefined = undefined;
    protected mDatabase = Databases.verbose();
    protected SqlScript: string = ``;
    protected keySecret: string | undefined = ``;
    protected mSearchAdd: string = ``;
    protected mKey: Array<any> = [];
    protected mVal: Array<any> = [];
    protected mSetData: Array<any> = [];
    protected mWhere: Array<any> = [];


    constructor(db: Database, key ?: string) {
        this.db = db;
        this.keySecret = key;
    }

    async CreateTable(tableName: string, CreateTableOptions: OptionsCreateTableDKASqlite): Promise<CreateTableCallback> {
        let mRules: OptionsCreateTableDKASqlite = CreateTableOptions;
        let mQuery = ``;
        let mDefault: string;
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
            if (this.keySecret !== undefined) {
                await this.db?.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    this.db?.run("PRAGMA cipher_compatibility = 4");
                    this.db?.run(`PRAGMA key = '${this.keySecret}'`);
                    await this.db?.run(this.SqlScript, [], async (error) => {
                        if (!error) {
                            await resolve({status: true, code: 200, msg: `Successfully, Created Table`})
                        } else {
                            await rejected({status: false, code: 500, msg: `Failed, Created Table `, error: error})
                        }
                    })
                })
            } else {
                await this.db?.run(this.SqlScript, [], async (error) => {
                    if (!error) {
                        await resolve({status: true, code: 200, msg: `Successfully, Created Table`})
                    } else {
                        await rejected({status: false, code: 500, msg: `Failed, Created Table `, error: error})
                    }
                })
            }


        })
    }

    async Insert(tableName: string = "__dka_test__", InsertOptions: OptionsInsertDKASqlite): Promise<InsertCallback> {
        let Rules: RulesInsert = InsertOptions;
        return new Promise(async (resolve, rejected) => {
            if (typeof Rules.data === "object") {
                /** Truncate Variable **/
                this.mKey = [];
                this.mVal = [];
                /** Object Looping While **/
                await Object.keys(Rules.data).forEach((key: string) => {
                    this.mKey.push(` \`${key}\` `);
                    this.mVal.push(`"${Rules.data?.[key]}"`);
                });

                this.SqlScript = `INSERT INTO \`${tableName}\` (${this.mKey})
                                  VALUES (${this.mVal}) `;
                if (this.keySecret !== undefined) {
                    await this.db?.serialize(async () => {
                        // This is the default, but it is good to specify explicitly:
                        this.db?.run("PRAGMA cipher_compatibility = 4");
                        this.db?.run(`PRAGMA key = '${this.keySecret}'`);
                        await this.db?.run(this.SqlScript, [], async (error) => {
                            if (!error) {
                                await resolve(
                                    {
                                        status: true,
                                        code: 200,
                                        msg: `Successfully, Created Data`,
                                        metadata: {
                                            rawSql: this.SqlScript
                                        }
                                    })
                            } else {
                                await rejected({status: false, code: 500, msg: `Failed, Created Data`, error: error})
                            }
                        })
                    })
                } else {
                    await this.db?.run(this.SqlScript, [], async (error) => {
                        if (!error) {
                            await resolve(
                                {
                                    status: true,
                                    code: 200,
                                    msg: `Successfully, Created Data`,
                                    metadata: {
                                        rawSql: this.SqlScript
                                    }
                                })
                        } else {
                            await rejected({status: false, code: 500, msg: `Failed, Created Data`, error: error})
                        }
                    })
                }
            } else if (Array.isArray(Rules.data)) {

                //@@@@@@@@@@@@@@@@@@@
                this.mVal = [];
                this.mKey = [];
                this.mSetData = [];
                //@@@@@@@@@@@@@@@@@@@

                //**********************************************************
                Rules.data.map(async (item: object, index: number) => {
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
                this.SqlScript = `INSERT INTO ${tableName} (${this.mKey})
                                  VALUES ${this.mVal} `;
                if (this.keySecret !== undefined) {
                    await this.db?.serialize(async () => {
                        // This is the default, but it is good to specify explicitly:
                        this.db?.run("PRAGMA cipher_compatibility = 4");
                        this.db?.run(`PRAGMA key = '${this.keySecret}'`);
                        await this.db?.run(this.SqlScript, [], async (error) => {
                            if (!error) {
                                await resolve(
                                    {
                                        status: true,
                                        code: 200,
                                        msg: `Successfully, Created Data`,
                                        metadata: {
                                            rawSql: this.SqlScript
                                        }
                                    })
                            } else {
                                await rejected({
                                    status: false,
                                    code: 500,
                                    msg: `Failed, Created Data`,
                                    sqlRaw: this.SqlScript,
                                    error: error
                                })
                            }
                        })
                    })
                } else {
                    await this.db?.run(this.SqlScript, [], async (error) => {
                        if (!error) {
                            await resolve(
                                {
                                    status: true,
                                    code: 200,
                                    msg: `Successfully, Created Data`,
                                    metadata: {
                                        rawSql: this.SqlScript
                                    }
                                })
                        } else {
                            await rejected({
                                status: false,
                                code: 500,
                                msg: `Failed, Created Data`,
                                sqlRaw: this.SqlScript,
                                error: error
                            })
                        }
                    })
                }
            }
        })
    }

    async Select(tableName: string = "__dka_test__", SelectOptions ?: OptionsSelectDKASqlite): Promise<SelectCallback> {
        this.mSearchAdd = ``;
        let checkJoin: Promise<string> = new Promise(async (resolve, rejected) => {
            let innerType = ``;
            let On = ``;
            if (SelectOptions?.join !== undefined) {
                if (SelectOptions?.as !== undefined) {
                    if (Array.isArray(SelectOptions?.join)) {
                        SelectOptions?.join.map(async (SelectJoin) => {
                            let mSelectJoinMode = (SelectJoin.mode !== undefined) ? `${SelectJoin.mode} ` : ``;
                            let joinAliasTableName = (SelectJoin.as !== undefined) ? `AS \`${SelectJoin.as}\`` : ``;
                            if (SelectJoin.on !== undefined) {
                                let mCheckCollNameFirst = (SelectJoin?.on.collNameFirst.collName === "ROW_ID") ? `rowid` : `\`${SelectJoin?.on.collNameFirst.collName}\``;
                                let mCheckCollNameSecond = (SelectJoin?.on.collNameSecond.collName === "ROW_ID") ? `rowid` : `\`${SelectJoin.on.collNameSecond.collName}\``;
                                if (SelectJoin.on.collNameFirst.tableAlias !== undefined) {
                                    On = ` ON \`${SelectJoin.on.collNameFirst.tableAlias}\`.${mCheckCollNameFirst} = \`${SelectJoin.on.collNameSecond.tableAlias}\`.${mCheckCollNameSecond} `;
                                } else {
                                    On = ` ON \`${SelectOptions?.as}\`.${mCheckCollNameFirst} = \`${SelectJoin.on.collNameSecond.tableAlias}\`.${mCheckCollNameSecond} `;
                                }
                            } else {
                                On = ``;
                            }
                            innerType += `${mSelectJoinMode}JOIN \`${SelectJoin.TableName}\` ${joinAliasTableName} ${On}`;
                        })
                    } else if (typeof SelectOptions?.join === "object") {

                        let mSelectJoinMode = (SelectOptions?.join.mode !== undefined) ? `${SelectOptions?.join.mode} ` : ``;
                        let joinAliasTableName = (SelectOptions?.join.as !== undefined) ? `AS \`${SelectOptions?.join.as}\`` : ``;
                        if (SelectOptions?.join.on !== undefined) {
                            let mCheckCollNameFirst = (SelectOptions?.join.on.collNameFirst.collName === "ROW_ID") ? `rowid` : `\`${SelectOptions?.join.on.collNameFirst.collName}\``;
                            let mCheckCollNameSecond = (SelectOptions?.join.on.collNameSecond.collName === "ROW_ID") ? `rowid` : `\`${SelectOptions?.join.on.collNameSecond.collName}\``;
                            if (SelectOptions?.join.on.collNameFirst.tableAlias !== undefined) {
                                On = ` ON \`${SelectOptions?.join.on.collNameFirst.tableAlias}\`.${mCheckCollNameFirst} = \`${SelectOptions?.join.on.collNameSecond.tableAlias}\`.${mCheckCollNameSecond} `;
                            } else {
                                On = ` ON \`${SelectOptions?.as}\`.${mCheckCollNameFirst} = \`${SelectOptions?.join.on.collNameSecond.tableAlias}\`.${mCheckCollNameSecond} `;
                            }
                        } else {
                            On = ``;
                        }

                        innerType += `${mSelectJoinMode}JOIN \`${SelectOptions?.join.TableName}\` ${joinAliasTableName} ${On}`;
                    }
                    await resolve(innerType)
                } else {
                    await rejected({
                        status: false,
                        code: 500,
                        msg: `join mode is exist. but parent as not set. please set first`
                    } as CallbackError)
                }
            } else {
                resolve(``)
            }
        })
        return new Promise(async (resolve, rejected) => {

            if (Array.isArray(SelectOptions?.search)) {

                await SelectOptions?.search.forEach((item) => {
                    if (typeof item === "object") {
                        let mCondition = (item.condition !== undefined) ? item.condition : `=`;
                        this.mSearchAdd += `\`${item.coloumName}\` ${mCondition} \'${item.data}\'`;
                    } else if (isString(item)) {
                        this.mSearchAdd += ` ${item} `;
                    }
                });
            } else if (typeof SelectOptions?.search === "object") {
                let mCondition = (SelectOptions?.search.condition !== undefined) ? SelectOptions?.search.condition : `=`;
                this.mSearchAdd += `\`${SelectOptions?.search.coloumName}\` ${mCondition} '${SelectOptions?.search.data}' `;
            }
            const UpdateWhere = (SelectOptions?.search !== undefined) ? ` WHERE ${this.mSearchAdd} ` : ``;
            const selectParentAs = (SelectOptions?.as !== undefined && SelectOptions?.as !== false) ? ` AS \`${SelectOptions?.as}\` ` : ` `;
            const checkJoinIsActive = (SelectOptions?.join === undefined) ? `ROWID as id, ` : ``;
            let mColumn = (SelectOptions?.column !== undefined) ? SelectOptions.column : "*";
            await checkJoin
                .then(async (innerType) => {
                    this.SqlScript = `SELECT ${checkJoinIsActive}${mColumn}
                                      FROM \`${tableName}\`${selectParentAs} ${innerType}${UpdateWhere}`;
                    if (this.keySecret !== undefined) {
                        await this.db?.serialize(async () => {
                            // This is the default, but it is good to specify explicitly:
                            this.db?.run("PRAGMA cipher_compatibility = 4");
                            this.db?.run(`PRAGMA key = '${this.keySecret}'`);
                            this.db?.all(this.SqlScript, [], async (error, row) => {
                                if (!error) {
                                    if (row.length > 0) {
                                        await resolve({
                                            status: true,
                                            code: 200,
                                            msg: `Successfully, getting data is success`,
                                            data: row,
                                            metadata: {
                                                rawSql: this.SqlScript
                                            }
                                        })
                                    } else {
                                        await rejected({
                                            status: false,
                                            code: 404,
                                            msg: `Successfully. but not data found`,
                                            metadata: {
                                                rawSql: this.SqlScript
                                            }
                                        })
                                    }
                                } else {
                                    await rejected({
                                        status: false,
                                        code: 500, msg: `Failed, select data is not success`,
                                        error: error,
                                        metadata: {
                                            rawSql: this.SqlScript
                                        }
                                    });
                                }
                            })
                        })
                    } else {
                        this.db?.all(this.SqlScript, [], async (error, row) => {
                            if (!error) {
                                if (row.length > 0) {
                                    await resolve({
                                        status: true,
                                        code: 200,
                                        msg: `Successfully, getting data is success`,
                                        data: row,
                                        metadata: {
                                            rawSql: this.SqlScript
                                        }
                                    })
                                } else {
                                    await rejected({
                                        status: false,
                                        code: 404,
                                        msg: `Successfully. but not data found`,
                                        metadata: {
                                            rawSql: this.SqlScript
                                        }
                                    })
                                }
                            } else {
                                await rejected({
                                    status: false,
                                    code: 500,
                                    msg: `Failed, select data is not success`,
                                    error: error,
                                    metadata: {
                                        rawSql: this.SqlScript
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
        const Rules: OptionsDeleteDKASqlite = merge({}, DeleteOptions);

        this.mWhere = [];

        return new Promise(async (resolve, rejected) => {
            if (Rules.search !== undefined) {
                Object.keys(Rules.search).forEach((key) => {
                    if (key !== "_rowId_") {
                        // @ts-ignore
                        this.mWhere.push(`\`${key}\`= "${Rules.search?.[key]}" `)
                    } else {
                        if (Rules.search !== undefined) {
                            this.mWhere.push(` ROWID=${Rules.search._rowId_}`)
                        }
                    }

                });
            }
            const DeleteWhere = (Rules.search !== undefined) ? `WHERE ${this.mWhere}` : ``;
            this.SqlScript = `DELETE
                              FROM \`${tableName}\` ${DeleteWhere} `;

            if (this.keySecret !== undefined) {
                await this.db?.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    this.db?.run("PRAGMA cipher_compatibility = 4");
                    this.db?.run(`PRAGMA key = '${this.keySecret}'`);
                    this.db?.run(this.SqlScript, function (error) {
                        if (!error) {
                            if (Rules.bypassChange === true) {
                                resolve({status: true, code: 200, msg: `Successfully, Delete Data`})
                            } else {
                                if (this.changes > 0) {
                                    resolve({status: true, code: 200, msg: `Successfully, Delete Data`})
                                } else {
                                    rejected({
                                        status: false,
                                        code: 500,
                                        msg: `Failed, Data Search Not Found or Not Exist`
                                    })
                                }
                            }

                        } else {
                            rejected({status: false, code: 500, msg: `Failed, Delete Data`, error: error})
                        }
                    })
                });
            } else {
                this.db?.run(this.SqlScript, function (error) {
                    if (!error) {
                        if (this.changes > 0) {
                            resolve({status: true, code: 200, msg: `Successfully, Delete Data`})
                        } else {
                            rejected({status: false, code: 500, msg: `Failed, Data Search Not Found or Not Exist`})
                        }
                    } else {
                        rejected({status: false, code: 500, msg: `Failed, Delete Data`, error: error})
                    }
                })
            }

        });
    }
}

const Sqlite = async (config: SqliteFunctionConfiguration = {filename: ""}): Promise<DB> => {

    let db: Database | undefined = undefined;
    let mDatabase = Databases.verbose();

    return new Promise(async (resolve, rejected) => {
        if (config.verbose === true) {
            db = await new mDatabase.Database(config.filename);
            if (config.key !== undefined) {
                await db.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    db?.run("PRAGMA cipher_compatibility = 4");
                    db?.run(`PRAGMA key = '${config.key}'`);
                    await db?.run(`CREATE TABLE IF NOT EXIST __dka_test__ ( id INT PRIMARY_KEY, user TEXT NOT NULL);`, [], async (error) => {
                        if (!Error){
                            let mDB = await new DB(db as Database, config.key);
                            await resolve(mDB)
                        }else{
                            const checkError = JSON.parse(JSON.stringify(error));
                            switch (checkError.errno) {
                                case 26 :
                                    await rejected({ status : false, code : checkError.errno, msg : `${checkError.code}. Failed Authentification Database Password`});
                                    break;
                                default :
                                    await rejected(checkError);
                                    break;
                            }
                        }
                    });

                });
            } else {
                await db.run(`CREATE TABLE IF NOT EXISTS __dka_test__ ( id INT PRIMARY_KEY, user TEXT NOT NULL)`,[], async (error) => {
                    if (!error){
                        let mDB = await new DB(db as Database);
                        await resolve(mDB)
                    }else{
                        const checkError = JSON.parse(JSON.stringify(error));
                        switch (checkError.errno) {
                            case 26 :
                                await rejected({ status : false, code : checkError.errno, msg : `${checkError.code}. Failed Authentification Database Password`});
                                break;
                            default :
                                await rejected(checkError);
                                break;
                        }
                    }
                })
            }

        } else {
            db = await new Database(config.filename);
            if (config.key !== undefined) {
                db.serialize(async () => {
                    // This is the default, but it is good to specify explicitly:
                    db?.run("PRAGMA cipher_compatibility = 4");
                    db?.run(`PRAGMA key = '${config.key}'`);
                    await db?.run(`CREATE TABLE IF NOT EXISTS __dka_test__ ( id INT PRIMARY_KEY, user TEXT NOT NULL)`, [], async (error) => {
                        if (!error){
                            let mDB = await new DB(db as Database, config.key);
                            await resolve(mDB)
                        }else{
                            const checkError = JSON.parse(JSON.stringify(error));
                            switch (checkError.errno) {
                                case 26 :
                                    await rejected({ status : false, code : checkError.errno, msg : `${checkError.code}. Failed Authentification Database Password`});
                                    break;
                                default :
                                    await rejected(checkError);
                                    break;
                            }

                        }
                    });
                });
            } else {
                db.run(`CREATE TABLE IF NOT EXISTS __dka_test__ ( id INT PRIMARY_KEY, user TEXT NOT NULL)`,[], async (error) => {
                    if (!error){
                        let mDB = await new DB(db as Database);
                        await resolve(mDB)
                    }else{
                        const checkError = JSON.parse(JSON.stringify(error));
                        switch (checkError.errno) {
                            case 26 :
                                await rejected({ status : false, code : checkError.errno, msg : `${checkError.code}. Failed Authentification Database Password`});
                                break;
                            default :
                                await rejected(checkError);
                                break;
                        }
                    }
                })
            }
        }
    })
}

export default Sqlite;