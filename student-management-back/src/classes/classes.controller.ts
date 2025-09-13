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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassQueryDto } from './dto/class-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createClassDto: CreateClassDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.classesService.create(userId, createClassDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() query: ClassQueryDto) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.classesService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.classesService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.classesService.update(userId, id, updateClassDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id; // Extract userId from JWT token
    return this.classesService.remove(userId, id);
  }
}
