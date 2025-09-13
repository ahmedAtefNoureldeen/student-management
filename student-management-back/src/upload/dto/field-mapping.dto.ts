import { IsString, IsNotEmpty } from 'class-validator';

export class FieldMappingDto {
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
}
