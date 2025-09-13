import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.studentsService.create(userId, createStudentDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: StudentQueryDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.studentsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.studentsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.studentsService.update(userId, id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.studentsService.remove(userId, id);
  }
}
