import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { createReadStream } from "node:fs";

function ensureConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    const missing: string[] = [];
    if (!cloud_name) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!api_key) missing.push("CLOUDINARY_API_KEY");
    if (!api_secret) missing.push("CLOUDINARY_API_SECRET");
    throw new Error(`Missing Cloudinary environment variables: ${missing.join(", ")}`);
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
}

export async function uploadToCloudinary(
  filePath: string,
  folder = "knc-horizon",
): Promise<{ url: string; publicId: string }> {
  ensureConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    createReadStream(filePath).pipe(stream);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureConfig();
  await cloudinary.uploader.destroy(publicId);
}
