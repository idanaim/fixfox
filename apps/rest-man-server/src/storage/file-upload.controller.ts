import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, S3_FOLDERS } from './s3.config';

@Controller('api/files')
export class FileUploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('equipment/:equipmentId/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEquipmentImage(
    @Param('equipmentId') equipmentId: string,
    @UploadedFile() file: any,
  ) {
    this.validateFile(file, ALLOWED_FILE_TYPES.images);
    
    const fileName = `${equipmentId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const result = await this.s3Service.uploadFile(file, S3_FOLDERS.EQUIPMENT_IMAGES, fileName);
    
    return {
      message: 'Equipment image uploaded successfully',
      ...result,
    };
  }

  @Post('users/:userId/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: any,
  ) {
    this.validateFile(file, ALLOWED_FILE_TYPES.images);
    
    const fileName = `${userId}-avatar.${file.originalname.split('.').pop()}`;
    const result = await this.s3Service.uploadFile(file, S3_FOLDERS.USER_AVATARS, fileName);
    
    return {
      message: 'User avatar uploaded successfully',
      ...result,
    };
  }

  @Post('issues/:issueId/attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadIssueAttachment(
    @Param('issueId') issueId: string,
    @UploadedFile() file: any,
  ) {
    this.validateFile(file, ALLOWED_FILE_TYPES.all);
    
    const fileName = `${issueId}-${Date.now()}-${file.originalname}`;
    const result = await this.s3Service.uploadFile(file, S3_FOLDERS.ISSUE_ATTACHMENTS, fileName);
    
    return {
      message: 'Issue attachment uploaded successfully',
      ...result,
    };
  }

  @Post('equipment/:equipmentId/manual')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEquipmentManual(
    @Param('equipmentId') equipmentId: string,
    @UploadedFile() file: any,
  ) {
    this.validateFile(file, ALLOWED_FILE_TYPES.documents);
    
    const fileName = `${equipmentId}-manual.${file.originalname.split('.').pop()}`;
    const result = await this.s3Service.uploadFile(file, S3_FOLDERS.EQUIPMENT_MANUALS, fileName);
    
    return {
      message: 'Equipment manual uploaded successfully',
      ...result,
    };
  }

  @Get('presigned-url')
  async getPresignedUploadUrl(
    @Query('key') key: string,
    @Query('contentType') contentType: string,
  ) {
    if (!key || !contentType) {
      throw new BadRequestException('Key and contentType are required');
    }

    const url = await this.s3Service.getPresignedUploadUrl(key, contentType);
    
    return {
      uploadUrl: url,
      key,
    };
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    const exists = await this.s3Service.fileExists(key);
    if (!exists) {
      throw new NotFoundException('File not found');
    }

    const url = await this.s3Service.getFileUrl(key);
    
    return {
      url,
      key,
    };
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    const exists = await this.s3Service.fileExists(key);
    if (!exists) {
      throw new NotFoundException('File not found');
    }

    await this.s3Service.deleteFile(key);
    
    return {
      message: 'File deleted successfully',
      key,
    };
  }

  private validateFile(file: any, allowedTypes: string[]) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }
} 