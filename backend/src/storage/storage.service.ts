import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private s3Endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>("SUPABASE_S3_BUCKET")!;
    this.s3Endpoint = this.config.get<string>("SUPABASE_S3_ENDPOINT")!;

    this.s3 = new S3Client({
      region: this.config.get<string>("SUPABASE_S3_REGION")!,
      credentials: {
        accessKeyId: this.config.get<string>("SUPABASE_S3_ACCESS_KEY_ID")!,
        secretAccessKey: this.config.get<string>(
          "SUPABASE_S3_SECRET_ACCESS_KEY",
        )!,
      },
      endpoint: this.s3Endpoint,
      forcePathStyle: true,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ key: string; url: string }> {
    const objectKey = `${folder}/${uuidv4()}-${file.originalname}`;

    // With memoryStorage, Multer always provides file.buffer (Node Buffer)
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer, // Buffer is valid for S3 Body
        ContentType: file.mimetype,
      }),
    );

    // Public URL pattern for Supabase Storage (public bucket)
    const publicBase = this.s3Endpoint.replace(
      "/storage/v1/s3",
      "/storage/v1/object/public",
    );
    const url = `${publicBase}/${this.bucket}/${objectKey}`;

    return { key: objectKey, url };
  }
}
