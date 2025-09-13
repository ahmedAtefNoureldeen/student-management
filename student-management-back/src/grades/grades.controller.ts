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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeQueryDto } from './dto/grade-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('grades')
@UseGuards(JwtAuthGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createGradeDto: CreateGradeDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.create(userId, createGradeDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() query: GradeQueryDto) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.update(userId, id, updateGradeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.remove(userId, id);
  }

  @Get('student/:studentId')
  findByStudent(@Request() req: AuthenticatedRequest, @Param('studentId') studentId: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.findByStudent(userId, studentId);
  }

  @Get('class/:classId')
  findByClass(@Request() req: AuthenticatedRequest, @Param('classId') classId: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.gradesService.findByClass(userId, classId);
  }
}
