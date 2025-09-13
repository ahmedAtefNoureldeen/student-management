import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { StudentClass } from 'src/students/entities/student-class.entity';
import { Grade } from 'src/grades/entities/grade.entity';


@Entity('classes')
@Index(['userId', 'name'], { unique: true }) // Unique class name per user
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.classes, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Grade, grade => grade.class)
  grades: Grade[];

  @OneToMany(() => StudentClass, studentClass => studentClass.class)
  studentClasses: StudentClass[];
}