import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { Grade } from '../grades/entities/grade.entity';
import { StudentClass } from '../students/entities/student-class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Class, Grade, StudentClass])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
