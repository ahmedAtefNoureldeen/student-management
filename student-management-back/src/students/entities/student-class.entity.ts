import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column, Index } from 'typeorm';
import { Student } from './student.entity';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';

@Entity('student_classes')
@Index(['userId', 'studentId', 'classId'], { unique: true }) // Unique student-class relationship per user
export class StudentClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  studentId: string;

  @Column('uuid')
  classId: string;

  @CreateDateColumn()
  enrolledAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Student, student => student.studentClasses, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => Class, classEntity => classEntity.studentClasses, { onDelete: 'CASCADE' })
  class: Class;
}