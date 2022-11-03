
export {default as MariaDB} from "./MariaDB"
export {default as Sqlite} from "./Sqlite";
export {default as Firestore } from "./Firestore"

import MariaDB from "./MariaDB";
import FireStore from "./Firestore";
import Sqlite from "./Sqlite";

const Database = {
    MariaDB : MariaDB,
    Sqlite : Sqlite,
    Firestore : FireStore
};
export default Database;
