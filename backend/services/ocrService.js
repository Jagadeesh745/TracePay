import vision from "@google-cloud/vision";
import { Storage } from "@google-cloud/storage";
import path from "path";

const client = new vision.ImageAnnotatorClient(); // Google Vision client
const storage = new Storage(); // Google Cloud Storage client
const BUCKET_NAME = "pfa-bucket"; // GCS bucket name

// Upload local file to Google Cloud Storage and return its GCS URI
async function uploadToGCS(filePath) {
  const destFileName = path.basename(filePath); // Use filename as destination
  await storage
    .bucket(BUCKET_NAME)
    .upload(filePath, { destination: destFileName });
  return `gs://${BUCKET_NAME}/${destFileName}`;
}

// Process receipt file (PDF or image) and extract text
export async function processReceipt(filePath) {
  const ext = path.extname(filePath).toLowerCase(); // Get file extension

  if (ext === ".pdf") {
    const gcsUri = await uploadToGCS(filePath); // Upload PDF to GCS

    // Send PDF to Google Vision API for text extraction
    const [result] = await client.batchAnnotateFiles({
      requests: [
        {
          inputConfig: {
            gcsSource: { uri: gcsUri },
            mimeType: "application/pdf",
          },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        },
      ],
    });

    // Extract text from the first response
    const text =
      result.responses?.[0]?.responses?.[0]?.fullTextAnnotation?.text || "";
    return text.trim();
  }

  // For images: detect text directly
  const [result] = await client.textDetection(filePath);
  return result.textAnnotations?.[0]?.description?.trim() || "";
}
