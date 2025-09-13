import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UploadService } from './upload.service';
import { FieldMappingDto } from './dto/field-mapping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('upload')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('headers')
  @UseInterceptors(FileInterceptor('file'))
  async getFileHeaders(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Please upload CSV or XLSX files.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    try {
      const headers = await this.uploadService.getFileHeaders(file);
      return {
        success: true,
        headers,
        message: 'File headers extracted successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to read file headers: ${error.message}`);
    }
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importFile(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Please upload CSV or XLSX files.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    // Parse mappings from JSON string
    let fieldMapping: FieldMappingDto;
    try {
      fieldMapping = JSON.parse(body.mappings);
    } catch (error) {
      throw new BadRequestException('Invalid mappings JSON format');
    }

    // Validate field mapping
    if (!fieldMapping.studentName || !fieldMapping.studentIdNumber || 
        !fieldMapping.class || !fieldMapping.grade) {
      throw new BadRequestException('All required field mappings must be provided');
    }

    const userId = req.user.id;

    try {
      const result = await this.uploadService.processFile(file, fieldMapping, userId);
      return result;
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }
}
