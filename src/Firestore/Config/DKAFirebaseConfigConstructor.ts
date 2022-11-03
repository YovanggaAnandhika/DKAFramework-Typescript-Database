import {FirebaseConfigConstructorConfiguration} from "./FirebaseConfigConstructor";
import {FirebaseAppSettings, FirebaseOptions} from "@firebase/app";



export interface DKAFirebaseConfigConstructor {
    options : FirebaseOptions,
    config ?: string | undefined
}