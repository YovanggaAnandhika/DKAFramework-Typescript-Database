import Database, {Sqlite} from "./../src";
import path from "path";


(async () => {
    /*let db = new Database.MariaDB({
        user : "developer",
        password : "Cyberhack2010",
        database : "akuntaris"
    });

    await db.Select(`akuntaris-user_login`, {
        search : [
            { username : "developer"},
            'AND',
            { password : "developer"}
        ]
    })
        .then(async (res) => {
            console.log(JSON.stringify(res));
        })
        .catch(async (error) => {
            console.log(JSON.stringify(error))
        });

    await db.Select(`akuntaris-data_inventory`)
        .then(async (res) => {
            console.log(JSON.stringify(res));
        })
        .catch(async (error) => {
            console.log(JSON.stringify(error))
        });*/

    let db = await Database.Sqlite({
        filename : path.join(__dirname,"./test.db"),
        key : "Cyberhack2010",
        callback : async (error) => {
            console.log(error)
        }
    });

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


