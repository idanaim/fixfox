import { ConfigService } from '@nestjs/config';

export interface S3Config {
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const getS3Config = (configService: ConfigService): S3Config => ({
  region: configService.get<string>('AWS_REGION', 'us-west-2'),
  bucketName: configService.get<string>('AWS_S3_BUCKET_NAME', 'fixfox-files'),
  accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
  secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
});

export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const S3_FOLDERS = {
  EQUIPMENT_IMAGES: 'equipment/images',
  USER_AVATARS: 'users/avatars',
  ISSUE_ATTACHMENTS: 'issues/attachments',
  EQUIPMENT_MANUALS: 'equipment/manuals'
}; 