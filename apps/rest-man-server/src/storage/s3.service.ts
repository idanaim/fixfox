import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Config, S3Config } from './s3.config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly config: S3Config;

  constructor(private configService: ConfigService) {
    this.config = getS3Config(configService);
    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: any,
    folder: string,
    fileName?: string
  ): Promise<{ key: string; url: string }> {
    try {
      const key = fileName ? `${folder}/${fileName}` : `${folder}/${Date.now()}-${file.originalname}`;
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
      });

      await this.s3Client.send(command);
      
      const url = `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
      
      this.logger.log(`File uploaded successfully: ${key}`);
      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFileUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
      return url;
    } catch (error) {
      this.logger.error(`Failed to get file URL: ${error.message}`);
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  }

  async getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
      return url;
    } catch (error) {
      this.logger.error(`Failed to get presigned upload URL: ${error.message}`);
      throw new Error(`Failed to get presigned upload URL: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      this.logger.error(`Failed to check file existence: ${error.message}`);
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }
} 