import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { Students, StudentUpdate } from './students.models';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  async addStudents(@Body() student: Students) {
    const newStudent = await this.studentsService.insertStudent(student);
    return newStudent;
  }

  @Get()
  getStudents() {
    return this.studentsService.fetchStudents();
  }

  @Get(':email')
  async getOneStudent(@Param('email') studentEmail: string) {
    const student = await this.studentsService.fetchOneStudent(studentEmail);
    return student;
  }
  
  @Patch(':id')
  async updateOneStudent(
    @Param('id') studentID: string,
    @Body() update: StudentUpdate,
  ) {
    return await this.studentsService.updateStudent(studentID, update);
  }

  @Delete(':id')
  deleteOneStudent(@Param('id') studentID: string) {
    return this.studentsService.deleteStudent(studentID);
  }
}
