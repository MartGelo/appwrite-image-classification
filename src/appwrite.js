import { Client, Databases, ID, Storage } from 'node-appwrite';

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
    this.storage = new Storage(client);
  }

  async getFile(bucketId, fileId) {
    return await this.storage.getFileDownload(bucketId, fileId);
  }

  async createImageLabels(databaseId, collectionId, imageId, labels) {
    await this.databases.createDocument(databaseId, collectionId, ID.unique(), {
      image: imageId,
      labels,
    });
  }
}

export default AppwriteService;
