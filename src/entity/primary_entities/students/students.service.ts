import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IStudent, StudentUpdate } from "./student.interface"
import { InjectModel } from '@nestjs/mongoose';
import { Student } from './students.models';
import { Model } from 'mongoose';

@Injectable()
export class StudentsService {
  constructor(@InjectModel(Student.name) private readonly studentModel: Model<Student>) { }

  async insertStudent(body: IStudent): Promise<IStudent> {
    const newStudent = new this.studentModel({
      regNumber: body.regNumber,
      firstname: body.firstname,
      lastname: body.lastname,
      gender: body.gender,
      dob: body.dob
    });
    const response = await newStudent.save();
    if (!response) throw new BadRequestException('New Student was not created!')
    return response
  }

  async fetchStudents(): Promise<IStudent[]> {
    const students = await this.studentModel.find().lean().exec();
    if (!students) throw new NotFoundException('Students were not found!')
    return students
  }

  async fetchOneStudent(studentRegNum: string): Promise<IStudent> {
    const student = await this.studentModel.findOne({ regNumber: studentRegNum }).lean();
    if (!student) throw new NotFoundException('Student was not found!');
    return student
  }

  async updateStudent(studentRegNum: string, body: StudentUpdate) {
    const result = await this.studentModel.updateOne({ regNumber: studentRegNum }, body, { new: true }).exec();
    if (!result.acknowledged) throw new BadRequestException('Student update operation failed!')
    return { updated: result.acknowledged };
  }

  async deleteStudent(studentRegNum: string) {
    const studResult = await this.studentModel.deleteOne({ regNumber: studentRegNum }).exec();
    if (studResult.deletedCount > 0) return { deleted: true };
    throw new BadRequestException('Student delete operation failed!')
  }
}
