import { VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";

import * as dotenv from "dotenv";

import { getDocuments } from "./loader";
import { initSettings } from "./settings";
import { STORAGE_CACHE_DIR } from "./shared";

// Load environment variables from local .env file
dotenv.config();

async function getRuntime(func: any) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

export async function generateDatasource(dataDirectory: string, outputDirectory: string) {
  console.log(`Generating storage context...`);
  // Split documents, create embeddings and store them in the storage context
  const ms = await getRuntime(async () => {
    const storageContext = await storageContextFromDefaults({
      persistDir: outputDirectory,
    });
    const documents = await getDocuments(dataDirectory);
    console.log(documents);
    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    console.log("Generated Vector store");
  });
  console.log(`Storage context successfully generated in ${ms / 1000}s.`);
  return true;
}

