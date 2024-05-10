export var STORAGE_CACHE_DIR = "./cache";

export function setCachePath(path: string) {
    STORAGE_CACHE_DIR = "./cache" + path;
}

