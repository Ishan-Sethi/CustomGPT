import { SimpleDirectoryReader } from "llamaindex";

export async function getDocuments(dataDirectory: string) {
  return await new SimpleDirectoryReader().loadData({
    directoryPath: dataDirectory,
  });
}
