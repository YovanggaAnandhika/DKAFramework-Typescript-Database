import Database, {Firestore, MariaDB} from "./../src";

(async () => {


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






    let db = new MariaDB({
        user : "developer",
        password : "Cyberhack2010",
        database : "akuntaris"
    });

    await db.Select(`akuntaris-user_login`, {
        as : `login`,
        column : [
            { alias : `login`, name : `id`},
            { alias : `sess`, name : `id`}
        ],
        /*column : [
            `id`,
            `name`
        ],*/
        join : [
            {
                mode : "INNER",
                as : `db`,
                TableName : `akuntaris-user_session`,
                on : {
                    collNameFirst : { tableAlias : `sess`, collName : `id_user_login`},
                    collNameSecond : { tableAlias : `log`, collName : `id_user_login`}
                }
            }
        ],
        limit : 1,
        orderBy : {
          mode : "ASC",
          column : [
              `id_user_login`
          ]
        },
        search : { coloumName : "test", condition : "=", data : `hai`}
    }).then(async (res) => {
        console.log(res.metadata?.sqlRaw)
    }).catch(async (error) => {
        console.log(error.metadata.sqlRaw)
    });

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

    /*let db = await Database.Sqlite({
        filename : path.join(__dirname,"./test.db"),
        key : "Cyberhack2010ejhfskuhfe8e3hr983hfnkj",
        callback : async (error) => {
            console.log(error)
        }
    })*/

    /*db?.CreateTable(`test`,{
        data : [
            { coloumn : `user`, type : "TEXT"}
        ]
    })
    .then(async (res) => {
        console.log(JSON.stringify(res));
    })
    .catch(async (error) => {
        console.log(JSON.stringify(error))
    });*/

    /*await db?.Insert(`test`, {
        data : {
            user : "developer"
        }
    })
    .then(async (res) => {
        console.log(JSON.stringify(res));
    })
    .catch(async (error) => {
        console.log(JSON.stringify(error))
    });*/


    /*await db?.Select()
    .then(async (res) => {
        console.log(JSON.stringify(res));
    })
    .catch(async (error) => {
        console.log(JSON.stringify(error))
    });*/


    /*await db?.Delete(`test`, {
        search : {
            _rowId_ : 4
        }
    })
        .then(async (res) => {
            console.log(JSON.stringify(res));
        })
        .catch(async (error) => {
            console.log(JSON.stringify(error))
        });*/


})();


