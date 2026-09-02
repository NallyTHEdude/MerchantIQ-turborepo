import cloudinary from "@/config/cloudinary";
import type {
  DocumentUploadOptions,
  DocumentUploadResult,
} from "@/data/types/Document";
import type { Readable } from "node:stream";
import { extname, basename } from "node:path";
import { randomUUID } from "node:crypto";

const sanitizeBaseName = (filename: string): string => {
  const ext = extname(filename);
  const nameWithoutExt = basename(filename, ext);

  return nameWithoutExt
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100);
};

export const uploadDocument = (
  fileStream: Readable,
  options: DocumentUploadOptions,
): Promise<DocumentUploadResult> => {
  return new Promise((resolve, reject) => {
    const folderPath = [options.folder, options.subFolder]
      .filter(Boolean)
      .join("/");

    const sanitizedName =
      sanitizeBaseName(options.originalFilename) || "document";
    const publicId = `${sanitizedName}-${randomUUID()}`;

    const cloudinaryStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        public_id: publicId,
        resource_type: "image",
        type: "upload",
        access_mode: "public",
        overwrite: false,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          const cloudinaryError =
            error instanceof Error
              ? error
              : new Error(`Cloudinary upload failed: ${JSON.stringify(error)}`);

          reject(cloudinaryError);
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    fileStream.on("error", (streamError) => {
      reject(
        streamError instanceof Error
          ? streamError
          : new Error("Document stream error while uploading"),
      );
    });

    fileStream.pipe(cloudinaryStream);
  });
};
