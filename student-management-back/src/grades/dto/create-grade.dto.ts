import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional, Min, Max, Length } from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;
}
