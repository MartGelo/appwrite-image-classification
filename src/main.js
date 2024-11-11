// Import dependencies
import AppwriteService from './appwrite.js';
import { HfInference } from '@huggingface/inference';

export default async ({ req, res, log, error }) => {
  // Load environment variables
  const databaseId = process.env.APPWRITE_DATABASE_ID ?? '66cb1b53001be653b43e';
  const collectionId =
    process.env.APPWRITE_COLLECTION_ID ?? '6731e45f0017ec714adf';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? '6731ec5900332522a160  ';

  // Extract fileId from the request body
  const fileId = req.body.$id || req.body.imageId;
  if (!fileId) {
    error('File ID is missing in the request');
    return res.text('Bad request: Missing file ID', 400);
  }

  if (req.body.bucketId && req.body.bucketId !== bucketId) {
    error('Bucket ID mismatch');
    return res.text('Bad request: Bucket ID mismatch', 400);
  }

  // Initialize Appwrite and Hugging Face services
  const appwrite = new AppwriteService();

  try {
    // Attempt to download the file from Appwrite Storage
    log('Fetching file from bucket...');
    const file = await appwrite.getFile(bucketId, fileId);
    log('File fetched successfully');

    // Initialize Hugging Face inference
    const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);
    log('Classifying image using Hugging Face API...');

    // Perform image classification
    const result = await hf.imageClassification({
      data: file,
      model: 'microsoft/resnet-50',
    });
    log('Image classified successfully', result);

    // Save the classification result to the Appwrite Database
    await appwrite.createImageLabels(databaseId, collectionId, fileId, result);
    log('Classification result saved to database');

    // Return the classification result
    return res.json(result);
  } catch (err) {
    // Handle errors and return a 500 status code
    error('Error in classification: ' + err.message);
    return res.text('Error processing image', 500);
  }
};
