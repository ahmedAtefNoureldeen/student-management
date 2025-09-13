import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @IsString()
  @IsNotEmpty()
  studentIdNumber: string;

  @IsString()
  @IsNotEmpty()
  class: string;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
