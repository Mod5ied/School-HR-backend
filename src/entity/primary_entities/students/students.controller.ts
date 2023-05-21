import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { IStudent, StudentUpdate } from './student.interface';
import { StudentsService } from './students.service';

@Controller("students")
export class StudentsController {
  constructor(private studentsService: StudentsService) { }

  @Post()
  async addStudents(@Body() student: IStudent) {
    const newStudent = await this.studentsService.insertStudent(student);
    return newStudent;
  }

  @Get()
  getStudents() {
    return this.studentsService.fetchStudents();
  }

  @Get(':regnumber')
  async getOneStudent(@Param('regnumber') regnumber: string) {
    const student = await this.studentsService.fetchOneStudent(regnumber);
    return student;
  }

  @Patch(':regnumber')
  async updateOneStudent(@Param('regnumber') regnumber: string, @Body() update: StudentUpdate) {
    return await this.studentsService.updateStudent(regnumber, update);
  }

  @Delete(':regnumber')
  deleteOneStudent(@Param('id') studentID: string) {
    return this.studentsService.deleteStudent(studentID);
  }
}
