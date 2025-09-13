import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassQueryDto } from './dto/class-query.dto';

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

export interface ClassWithStats {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  averageGrade: number | null;
  totalStudents: number;
  totalGrades: number;
  students: Array<{
    id: string;
    name: string;
    idNumber: string;
    enrolledAt: Date;
    grade?: number;
  }>;
  grades: Array<{
    id: string;
    grade: number;
    notes: string;
    student: {
      id: string;
      name: string;
      idNumber: string;
    };
    createdAt: Date;
  }>;
}

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
  ) {}

  async create(userId: string, createClassDto: CreateClassDto): Promise<Class> {
    // Check for duplicate class name within the same user
    const existingClass = await this.classesRepository.findOne({
      where: { userId, name: createClassDto.name },
    });

    if (existingClass) {
      throw new ConflictException('Class with this name already exists');
    }

    const classEntity = this.classesRepository.create({
      ...createClassDto,
      userId,
    });

    return this.classesRepository.save(classEntity);
  }

  async findAll(userId: string, query: ClassQueryDto): Promise<PaginatedResponse<ClassWithStats>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    let queryBuilder = this.classesRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.grades', 'grades')
      .leftJoinAndSelect('grades.student', 'gradeStudent')
      .leftJoinAndSelect('class.studentClasses', 'studentClasses')
      .leftJoinAndSelect('studentClasses.student', 'student')
      .where('class.userId = :userId', { userId });

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(class.name LIKE :search OR class.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Normalize sort order to uppercase
    const normalizedSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Apply sorting
    queryBuilder = queryBuilder.orderBy(`class.${sortBy}`, normalizedSortOrder);

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const classes = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    // Transform classes to include statistics
    const classesWithStats = await Promise.all(
      classes.map(async (classEntity) => this.addClassStatistics(classEntity))
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: classesWithStats,
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

  async findOne(userId: string, id: string): Promise<ClassWithStats> {
    const classEntity = await this.classesRepository.findOne({
      where: { id, userId },
      relations: ['grades', 'grades.student', 'studentClasses', 'studentClasses.student'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return this.addClassStatistics(classEntity);
  }

  async update(userId: string, id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.findClassEntity(userId, id);

    // If name is being updated, check for duplicates
    if (updateClassDto.name && updateClassDto.name !== classEntity.name) {
      const existingClass = await this.classesRepository.findOne({
        where: { userId, name: updateClassDto.name },
      });

      if (existingClass) {
        throw new ConflictException('Class with this name already exists');
      }
    }

    // Update the class entity
    Object.assign(classEntity, updateClassDto);
    return this.classesRepository.save(classEntity);
  }

  async remove(userId: string, id: string): Promise<void> {
    const classEntity = await this.findClassEntity(userId, id);
    await this.classesRepository.remove(classEntity);
  }

  async findByUser(userId: string): Promise<Class[]> {
    return this.classesRepository.find({
      where: { userId },
      relations: ['grades', 'grades.student', 'studentClasses', 'studentClasses.student'],
    });
  }

  private async findClassEntity(userId: string, id: string): Promise<Class> {
    const classEntity = await this.classesRepository.findOne({
      where: { id, userId },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  private async addClassStatistics(classEntity: Class): Promise<ClassWithStats> {
    // Calculate average grade
    const grades = classEntity.grades || [];
    const averageGrade = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + Number(grade.grade), 0) / grades.length 
      : null;

    // Get unique students enrolled
    const studentClasses = classEntity.studentClasses || [];
    const uniqueStudents = studentClasses.map(sc => sc.student);

    // Create student-grade mapping
    const studentGradeMap = new Map();
    grades.forEach(grade => {
      studentGradeMap.set(grade.student.id, grade.grade);
    });

    // Transform students with their grades
    const studentsWithGrades = uniqueStudents.map(student => ({
      id: student.id,
      name: student.name,
      idNumber: student.idNumber,
      enrolledAt: studentClasses.find(sc => sc.student.id === student.id)?.enrolledAt || new Date(),
      grade: studentGradeMap.get(student.id),
    }));

    // Transform grades with student info
    const gradesWithStudentInfo = grades.map(grade => ({
      id: grade.id,
      grade: Number(grade.grade),
      notes: grade.notes,
      student: {
        id: grade.student.id,
        name: grade.student.name,
        idNumber: grade.student.idNumber,
      },
      createdAt: grade.createdAt,
    }));

    return {
      id: classEntity.id,
      name: classEntity.name,
      description: classEntity.description,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
      averageGrade: averageGrade ? Number(averageGrade.toFixed(2)) : null,
      totalStudents: uniqueStudents.length,
      totalGrades: grades.length,
      students: studentsWithGrades,
      grades: gradesWithStudentInfo,
    };
  }
}
