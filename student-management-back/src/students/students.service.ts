import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';

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

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(userId: string, createStudentDto: CreateStudentDto): Promise<Student> {
    // Check for duplicate idNumber within the same user
    const existingStudent = await this.studentsRepository.findOne({
      where: { userId, idNumber: createStudentDto.idNumber },
    });

    if (existingStudent) {
      throw new ConflictException('Student with this ID number already exists');
    }

    const student = this.studentsRepository.create({
      ...createStudentDto,
      userId,
    });

    return this.studentsRepository.save(student);
  }

  async findAll(userId: string, query: StudentQueryDto): Promise<PaginatedResponse<Student>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = { userId };

    if (search) {
      whereCondition.name = Like(`%${search}%`);
      // For search, we need to use OR condition for both name and idNumber
      // TypeORM doesn't support OR in the same where object, so we'll use query builder
    }

    let queryBuilder = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.grades', 'grades')
      .leftJoinAndSelect('student.studentClasses', 'studentClasses')
      .leftJoinAndSelect('studentClasses.class', 'class')
      .where('student.userId = :userId', { userId });

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(student.name LIKE :search OR student.idNumber LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Normalize sort order to uppercase
    const normalizedSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Apply sorting
    queryBuilder = queryBuilder.orderBy(`student.${sortBy}`, normalizedSortOrder);

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const students = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: students,
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

  async findOne(userId: string, id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id, userId },
      relations: ['grades', 'studentClasses', 'studentClasses.class'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(userId: string, id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(userId, id);

    // If idNumber is being updated, check for duplicates
    if (updateStudentDto.idNumber && updateStudentDto.idNumber !== student.idNumber) {
      const existingStudent = await this.studentsRepository.findOne({
        where: { userId, idNumber: updateStudentDto.idNumber },
      });

      if (existingStudent) {
        throw new ConflictException('Student with this ID number already exists');
      }
    }

    Object.assign(student, updateStudentDto);
    return this.studentsRepository.save(student);
  }

  async remove(userId: string, id: string): Promise<void> {
    const student = await this.findOne(userId, id);
    await this.studentsRepository.remove(student);
  }

  async findByUser(userId: string): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { userId },
      relations: ['grades', 'studentClasses', 'studentClasses.class'],
    });
  }
}
