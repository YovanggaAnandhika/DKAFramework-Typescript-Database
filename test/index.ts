import Database, {Firestore, MariaDB, MongoDB} from "./../src";
import path from "path";


(async () => {


    /*MongoDB({
        host : "localhost",
        port : 2833,
    }).then(async (res) => {

    })*/

    /*let db = new Firestore({
        options : {
            apiKey: "AIzaSyCFV8E2Hi2b0ru6L_dwaUdZljeu1MXRunc",
            authDomain: "dka-apis.firebaseapp.com",
            databaseURL: "https://dka-apis-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "dka-apis",
            storageBucket: "dka-apis.appspot.com",
            messagingSenderId: "797501409741",
            appId: "1:797501409741:web:85c5ecd5a69e4a81bc5c84",
            measurementId: "G-1MT7ZM6VKT"
        },
        config : "DEFAULT"
    });

    db.collection("DKA")*/






    /*let db = new MariaDB({
        user : "developer",
        password : "Cyberhack2010",
        database : "nd_parking"
    });*/

    /*await db.Procedure("TEST", {
        id : 2
    })
        .then(async (res) => {
            console.log(res)
        })
        .catch(async (error) => {
            console.error(error)
        })*/
    /*await db.Select(`parking_user_login`, {
        as : `login`,
        /!*column : [
            `id`,
            `name`
        ],*!/
        join : {
            mode : "INNER",
            as : `corporation`,
            TableName : `parking_system_corporation`,
            on : {
                collNameFirst : { collName : `id_system_corporation`},
                collNameSecond : { tableAlias : `corporation`, collName : `id_system_corporation`}
            }
        }
    }).then(async (res) => {
        console.log(res)
    }).catch(async (error) => {
        console.log(error)
    });*/

    /*
        .then(async (res) => {
            console.log(JSON.stringify(res));
        })
        .catch(async (error) => {
            console.log(JSON.stringify(error))
        });*/

    /*

    await db.Select(`akuntaris-data_inventory`)
        .then(async (res) => {
            console.log(JSON.stringify(res));
        })
        .catch(async (error) => {
            console.log(JSON.stringify(error))
        });*/

    let mDB = await Database.Sqlite({ filename : path.resolve(__dirname,"./dka.dka"), key : "Cyberhack2010" })
        .then(async (DB) => {
            await DB.Select("__dka_test__")
                .then(async (res) => {
                    console.log(res)
                }).catch(async (error) => {
                console.error(error)
            })
        }).catch(async (error) => {
            console.error(error)
        })
    /*
    mDB.Select("__dka_test__")
        .then(async (res) => {
            console.log(res)
        }).catch(async (error) => {
        console.error(error)
    })*/


})();


