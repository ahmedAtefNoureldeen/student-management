import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { Grade } from '../grades/entities/grade.entity';
import { StudentClass } from '../students/entities/student-class.entity';
import { FieldMappingDto } from './dto/field-mapping.dto';
import { ImportResultDto } from './dto/import-result.dto';

export interface ParsedRow {
  studentName: string;
  studentIdNumber: string;
  class: string;
  grade: number;
  notes?: string;
}

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(StudentClass)
    private studentClassesRepository: Repository<StudentClass>,
  ) {}

  async processFile(
    file: Express.Multer.File,
    fieldMapping: FieldMappingDto,
    userId: string,
  ): Promise<ImportResultDto> {
    const statistics = {
      totalRows: 0,
      processedRows: 0,
      studentsCreated: 0,
      studentsUpdated: 0,
      classesCreated: 0,
      classesReused: 0,
      studentClassesCreated: 0,
      studentClassesReused: 0,
      gradesCreated: 0,
      gradesUpdated: 0,
      errors: 0,
    };

    const errors: Array<{ row: number; field?: string; message: string }> = [];

    try {
      // Parse file based on extension
      const rows = await this.parseFile(file, fieldMapping);
      statistics.totalRows = rows.length;

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        try {
          await this.processRow(rows[i], userId, statistics);
          statistics.processedRows++;
        } catch (error) {
          statistics.errors++;
          errors.push({
            row: i + 1,
            message: error.message,
          });
        }
      }

      return {
        success: statistics.errors === 0,
        message: `Import completed. Processed ${statistics.processedRows} of ${statistics.totalRows} rows.`,
        statistics,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        statistics,
        errors: [{ row: 0, message: error.message }],
      };
    }
  }

  private async parseFile(
    file: Express.Multer.File,
    fieldMapping: FieldMappingDto,
  ): Promise<ParsedRow[]> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      return this.parseCSV(file, fieldMapping);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.parseExcel(file, fieldMapping);
    } else {
      throw new BadRequestException('Unsupported file type. Please upload CSV or XLSX files.');
    }
  }

  private async parseCSV(
    file: Express.Multer.File,
    fieldMapping: FieldMappingDto,
  ): Promise<ParsedRow[]> {
    return new Promise((resolve, reject) => {
      const results: ParsedRow[] = [];
      const stream = Readable.from(file.buffer);

      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            const parsedRow = this.mapRowToFields(row, fieldMapping);
            if (parsedRow) {
              results.push(parsedRow);
            }
          } catch (error) {
            // Skip invalid rows
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private async parseExcel(
    file: Express.Multer.File,
    fieldMapping: FieldMappingDto,
  ): Promise<ParsedRow[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results: ParsedRow[] = [];
      for (const row of jsonData) {
        try {
          const parsedRow = this.mapRowToFields(row, fieldMapping);
          if (parsedRow) {
            results.push(parsedRow);
          }
        } catch (error) {
          // Skip invalid rows
        }
      }

      return results;
    } catch (error) {
      throw new BadRequestException('Failed to parse Excel file');
    }
  }

  private mapRowToFields(row: any, fieldMapping: FieldMappingDto): ParsedRow | null {
    try {
      const studentName = row[fieldMapping.studentName]?.toString().trim();
      const studentIdNumber = row[fieldMapping.studentIdNumber]?.toString().trim();
      const className = row[fieldMapping.class]?.toString().trim();
      const gradeValue = row[fieldMapping.grade];

      if (!studentName || !studentIdNumber || !className || gradeValue === undefined) {
        return null;
      }

      const grade = parseFloat(gradeValue);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        throw new Error(`Invalid grade value: ${gradeValue}`);
      }

      return {
        studentName,
        studentIdNumber,
        class: className,
        grade,
        notes: row.notes?.toString().trim(),
      };
    } catch (error) {
      throw new Error(`Failed to map row: ${error.message}`);
    }
  }

  private async processRow(
    row: ParsedRow,
    userId: string,
    statistics: any,
  ): Promise<void> {
    // Process Student
    let student = await this.studentsRepository.findOne({
      where: { idNumber: row.studentIdNumber, userId },
    });

    if (student) {
      // Update name if changed
      if (student.name !== row.studentName) {
        student.name = row.studentName;
        await this.studentsRepository.save(student);
        statistics.studentsUpdated++;
      }
    } else {
      // Create new student
      student = this.studentsRepository.create({
        name: row.studentName,
        idNumber: row.studentIdNumber,
        userId,
      });
      await this.studentsRepository.save(student);
      statistics.studentsCreated++;
    }

    // Process Class
    let classEntity = await this.classesRepository.findOne({
      where: { name: row.class, userId },
    });

    if (classEntity) {
      // Reuse existing class
      statistics.classesReused++;
    } else {
      // Create new class
      classEntity = this.classesRepository.create({
        name: row.class,
        description: `Imported from file`,
        userId,
      });
      await this.classesRepository.save(classEntity);
      statistics.classesCreated++;
    }

    // Process StudentClass relationship
    let studentClass = await this.studentClassesRepository.findOne({
      where: {
        userId,
        studentId: student.id,
        classId: classEntity.id,
      },
    });

    if (studentClass) {
      // Reuse existing relationship
      statistics.studentClassesReused++;
    } else {
      // Create new student-class relationship
      studentClass = this.studentClassesRepository.create({
        userId,
        studentId: student.id,
        classId: classEntity.id,
      });
      await this.studentClassesRepository.save(studentClass);
      statistics.studentClassesCreated++;
    }

    // Process Grade
    let grade = await this.gradesRepository.findOne({
      where: {
        studentId: student.id,
        classId: classEntity.id,
        userId,
      },
    });

    if (grade) {
      // Update existing grade
      grade.grade = row.grade;
      if (row.notes) {
        grade.notes = row.notes;
      }
      await this.gradesRepository.save(grade);
      statistics.gradesUpdated++;
    } else {
      // Create new grade
      grade = this.gradesRepository.create({
        grade: row.grade,
        notes: row.notes || '',
        studentId: student.id,
        classId: classEntity.id,
        userId,
      });
      await this.gradesRepository.save(grade);
      statistics.gradesCreated++;
    }
  }

  async getFileHeaders(file: Express.Multer.File): Promise<string[]> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      return this.getCSVHeaders(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.getExcelHeaders(file);
    } else {
      throw new BadRequestException('Unsupported file type. Please upload CSV or XLSX files.');
    }
  }

  private async getCSVHeaders(file: Express.Multer.File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer);
      let headers: string[] = [];

      stream
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
          stream.destroy(); // Stop reading after getting headers
        })
        .on('end', () => resolve(headers))
        .on('error', reject);
    });
  }

  private async getExcelHeaders(file: Express.Multer.File): Promise<string[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        headers.push(cell ? cell.v.toString() : '');
      }

      return headers;
    } catch (error) {
      throw new BadRequestException('Failed to read Excel file headers');
    }
  }
}
