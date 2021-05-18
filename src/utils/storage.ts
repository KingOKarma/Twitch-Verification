import { dump, load } from "js-yaml";
import { STORAGE } from "./globals";
import fs from "fs";

export interface Verifiy {
    attempts: number;
    channel: string;
    hasVerified: boolean;
    id: string;
}

/**
 * This represents the storage.yml
 * @class Storage
 * @property {string} verify

 */
export default class Storage {
    private static readonly _configLocation = "./storage.yml";

    public readonly verify: Verifiy[];


    private constructor() {
        this.verify = [
            {
                attempts: 0,
                channel: "",
                hasVerified: false,
                id: ""
            }];

    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Storage {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!fs.existsSync(Storage._configLocation)) {
            throw new Error("Please create a storage.yml");
        }
        const fileContents = fs.readFileSync(
            Storage._configLocation,
            "utf-8"
        );
        const casted = load(fileContents) as Storage;

        return casted;
    }

    /**
   *  Safe the storage to the storage.yml default location
   */
    public static saveConfig(): void {
        fs.writeFileSync(Storage._configLocation, dump(STORAGE));
    }
}