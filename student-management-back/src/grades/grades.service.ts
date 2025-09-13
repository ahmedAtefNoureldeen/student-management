import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeQueryDto } from './dto/grade-query.dto';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GradeWithRelations {
  id: string;
  grade: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    name: string;
    idNumber: string;
  };
  class: {
    id: string;
    name: string;
    description: string;
  };
}

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
  ) {}

  async create(userId: string, createGradeDto: CreateGradeDto): Promise<Grade> {
    // Validate that student belongs to the user
    const student = await this.studentsRepository.findOne({
      where: { id: createGradeDto.studentId, userId },
    });

    if (!student) {
      throw new BadRequestException('Student not found or does not belong to you');
    }

    // Validate that class belongs to the user
    const classEntity = await this.classesRepository.findOne({
      where: { id: createGradeDto.classId, userId },
    });

    if (!classEntity) {
      throw new BadRequestException('Class not found or does not belong to you');
    }

    // Check for duplicate grade (one grade per student per class per user)
    const existingGrade = await this.gradesRepository.findOne({
      where: { 
        userId, 
        studentId: createGradeDto.studentId, 
        classId: createGradeDto.classId 
      },
    });

    if (existingGrade) {
      throw new ConflictException('Grade already exists for this student in this class');
    }

    const grade = this.gradesRepository.create({
      ...createGradeDto,
      userId,
    });

    return this.gradesRepository.save(grade);
  }

  async findAll(userId: string, query: GradeQueryDto): Promise<PaginatedResponse<GradeWithRelations>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      studentId, 
      classId, 
      gradeMin, 
      gradeMax, 
      subject,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = query;
    const skip = (page - 1) * limit;

    let queryBuilder = this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.class', 'class')
      .where('grade.userId = :userId', { userId });

    // Apply filters
    if (studentId) {
      queryBuilder = queryBuilder.andWhere('grade.studentId = :studentId', { studentId });
    }

    if (classId) {
      queryBuilder = queryBuilder.andWhere('grade.classId = :classId', { classId });
    }

    if (gradeMin !== undefined) {
      queryBuilder = queryBuilder.andWhere('grade.grade >= :gradeMin', { gradeMin });
    }

    if (gradeMax !== undefined) {
      queryBuilder = queryBuilder.andWhere('grade.grade <= :gradeMax', { gradeMax });
    }

    if (subject) {
      queryBuilder = queryBuilder.andWhere('class.name LIKE :subject', { subject: `%${subject}%` });
    }

    // Apply search
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(student.name LIKE :search OR class.name LIKE :search OR grade.notes LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Normalize sort order to uppercase
    const normalizedSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Apply sorting
    if (sortBy === 'name') {
      // Sort by student name
      queryBuilder = queryBuilder.orderBy('student.name', normalizedSortOrder);
    } else if (sortBy === 'class') {
      // Sort by class name
      queryBuilder = queryBuilder.orderBy('class.name', normalizedSortOrder);
    } else if (sortBy === 'grade') {
      // Sort by grade value
      queryBuilder = queryBuilder.orderBy('grade.grade', normalizedSortOrder);
    } else {
      // Default sorting by the specified field on grade entity
      queryBuilder = queryBuilder.orderBy(`grade.${sortBy}`, normalizedSortOrder);
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const grades = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    // Transform grades to include relations
    const gradesWithRelations = grades.map(grade => this.transformGradeWithRelations(grade));

    const totalPages = Math.ceil(total / limit);

    return {
      data: gradesWithRelations,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<GradeWithRelations> {
    const grade = await this.gradesRepository.findOne({
      where: { id, userId },
      relations: ['student', 'class'],
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return this.transformGradeWithRelations(grade);
  }

  async update(userId: string, id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findGradeEntity(userId, id);

    // If studentId or classId is being updated, validate the new relationships
    if (updateGradeDto.studentId && updateGradeDto.studentId !== grade.studentId) {
      const student = await this.studentsRepository.findOne({
        where: { id: updateGradeDto.studentId, userId },
      });

      if (!student) {
        throw new BadRequestException('Student not found or does not belong to you');
      }
    }

    if (updateGradeDto.classId && updateGradeDto.classId !== grade.classId) {
      const classEntity = await this.classesRepository.findOne({
        where: { id: updateGradeDto.classId, userId },
      });

      if (!classEntity) {
        throw new BadRequestException('Class not found or does not belong to you');
      }
    }

    // If both studentId and classId are being updated, check for duplicates
    if (updateGradeDto.studentId && updateGradeDto.classId) {
      const existingGrade = await this.gradesRepository.findOne({
        where: { 
          userId, 
          studentId: updateGradeDto.studentId, 
          classId: updateGradeDto.classId 
        },
      });

      if (existingGrade && existingGrade.id !== id) {
        throw new ConflictException('Grade already exists for this student in this class');
      }
    }

    // Update the grade entity
    Object.assign(grade, updateGradeDto);
    return this.gradesRepository.save(grade);
  }

  async remove(userId: string, id: string): Promise<void> {
    const grade = await this.findGradeEntity(userId, id);
    await this.gradesRepository.remove(grade);
  }

  async findByStudent(userId: string, studentId: string): Promise<GradeWithRelations[]> {
    // Validate that student belongs to the user
    const student = await this.studentsRepository.findOne({
      where: { id: studentId, userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to you');
    }

    const grades = await this.gradesRepository.find({
      where: { userId, studentId },
      relations: ['student', 'class'],
      order: { createdAt: 'DESC' },
    });

    return grades.map(grade => this.transformGradeWithRelations(grade));
  }

  async findByClass(userId: string, classId: string): Promise<GradeWithRelations[]> {
    // Validate that class belongs to the user
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, userId },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found or does not belong to you');
    }

    const grades = await this.gradesRepository.find({
      where: { userId, classId },
      relations: ['student', 'class'],
      order: { createdAt: 'DESC' },
    });

    return grades.map(grade => this.transformGradeWithRelations(grade));
  }

  private async findGradeEntity(userId: string, id: string): Promise<Grade> {
    const grade = await this.gradesRepository.findOne({
      where: { id, userId },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return grade;
  }

  private transformGradeWithRelations(grade: Grade): GradeWithRelations {
    return {
      id: grade.id,
      grade: Number(grade.grade),
      notes: grade.notes,
      createdAt: grade.createdAt,
      updatedAt: grade.updatedAt,
      student: {
        id: grade.student.id,
        name: grade.student.name,
        idNumber: grade.student.idNumber,
      },
      class: {
        id: grade.class.id,
        name: grade.class.name,
        description: grade.class.description,
      },
    };
  }
}
