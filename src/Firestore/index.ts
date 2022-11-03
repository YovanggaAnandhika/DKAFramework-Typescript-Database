/*import firebase, {FirebaseApp, initializeApp, FirebaseOptions,  } from "firebase/app";
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, CollectionReference, QueryDocumentSnapshot, DocumentReference, DocumentData }
    from "firebase/firestore"*/
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import {DKAFirebaseConfigConstructor} from "./Config/DKAFirebaseConfigConstructor";

export class FireStore {

    private get Firestore(): firebase.firestore.Firestore | undefined {
        return this._Firestore;
    }

    private set Firestore(value: firebase.firestore.Firestore | undefined) {
        this._Firestore = value;
    }

    private get app(): firebase.app.App | undefined {
        return this._app;
    }

    private set app(value: firebase.app.App | undefined) {
        this._app = value;
    }

    private _app : firebase.app.App | undefined
    private _Firestore : firebase.firestore.Firestore | undefined;

    constructor(config : DKAFirebaseConfigConstructor) {

        let mConfig : DKAFirebaseConfigConstructor | undefined = config;

        switch (typeof mConfig?.config) {
            case "string":
                this.app = firebase.initializeApp(mConfig.options, mConfig?.config)
                this.Firestore = firebase.firestore(this.app)
                break;
            default :
                this.app = firebase.initializeApp({});
                this.Firestore = firebase.firestore(this.app)
                break;
        }
    }

    collection(collectionPath : string) : firebase.firestore.CollectionReference<firebase.firestore.DocumentData>  {
        return this.Firestore?.collection(collectionPath)!;
    }

}

export default FireStore;