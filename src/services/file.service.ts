import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../utils/s3";
import { v4 as uuidv4 } from "uuid";
import { fileRepository } from "../repositories/file.repository";

const BUCKET = process.env.S3_BUCKET || "your-bucket";

export class FileService {
  static async generateUploadUrl(userId: number, role: string, mimeType: string) {
    if (!mimeType) {
      throw new Error("Missing mimeType");
    }

    const fileId = uuidv4();
    const key = `uploads/${userId}/${fileId}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    // Save metadata in DB
    await fileRepository.create({
      id: fileId,
      key,
      userId,
      roleAccess: role,
      mimeType,
    });

    return { url, fileId };
  }

  static async generateDownloadUrl(fileId: string, userRole: string) {
    if (!fileId) {
      throw new Error("Invalid file ID");
    }

    const file = await fileRepository.getById(fileId);

    if (!file) {
      const err: any = new Error("Invalid file ID");
      err.status = 404;
      throw err;
    }

    // only the allowed role or admin can download
    if (file.roleAccess !== userRole && userRole !== "admin") {
      const err: any = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: file.key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    return { url };
  }
}