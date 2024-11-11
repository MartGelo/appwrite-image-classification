import AppwriteService from './appwrite.js';
import { HfInference } from '@huggingface/inference';

export default async ({ req, res, log, error }) => {
  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'ai';
  const collectionId =
    process.env.APPWRITE_COLLECTION_ID ?? 'image_classification';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'image_classification';

  const fileId = req.body.$id || req.body.imageId;
  if (!fileId || (req.body.bucketId && req.body.bucketId != bucketId)) {
    return res.text('Bad request', 400);
  }

  const appwrite = new AppwriteService();

  try {
    const file = await appwrite.getFile(bucketId, fileId);
    const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);

    const result = await hf.imageClassification({
      data: file,
      model: 'microsoft/resnet-50',
    });

    await appwrite.createImageLabels(databaseId, collectionId, fileId, result);
    log('Image ' + fileId + ' classified', result);

    return res.json(result);
  } catch (err) {
    error('Error in classification: ' + err.message);
    return res.text('Error processing image', 500);
  }
};
