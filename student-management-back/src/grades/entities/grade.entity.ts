import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity('grades')
@Index(['userId', 'studentId', 'classId'], { unique: true }) // One grade per student per class per user
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 5, scale: 2 })
  grade: number;

  @Column({ nullable: true })
  notes: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  studentId: string;

  @Column('uuid')
  classId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.grades, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Student, student => student.grades, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => Class, classEntity => classEntity.grades, { onDelete: 'CASCADE' })
  class: Class;
}