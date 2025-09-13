import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { Grade } from '../grades/entities/grade.entity';
import { StudentClass } from '../students/entities/student-class.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Student, Class, Grade, StudentClass],
  synchronize: true, // Set to false in production
  logging: true,
};