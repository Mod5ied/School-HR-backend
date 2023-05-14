import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Student,
  Students,
  StudentUpdate,
} from './students.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<Students>,
  ) {}

  async insertStudent(body: Students): Promise<Students> {
    const newStudent = new this.studentModel({
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      gender: body.gender,
    });
    return await newStudent.save();
  }

  async fetchStudents(): Promise<Students[]> {
    const students = await this.studentModel.find().lean().exec();
    return students.map((stud) => ({
      id: stud.id,
      email: stud.email,
      firstname: stud.firstname,
      lastname: stud.lastname,
      gender: stud.gender,
      scores: stud.scores,
    }));
  }

  async fetchOneStudent(studentEmail: string): Promise<Students> {
    const student = await this.studentModel
      .findOne({ email: studentEmail })
      .lean();
    if (!student) throw new NotFoundException('Student was not found');
    return student
  }

  async updateStudent(studentEmail: string, body: StudentUpdate) {
    const result = await this.studentModel
      .updateOne({ email: studentEmail }, body, { new: true })
      .exec();
    return { updated: result.acknowledged };
  }

  async deleteStudent(studentEmail: string) {
    const studResult = await this.studentModel
      .deleteOne({ email: studentEmail })
      .exec();
    if (studResult.deletedCount > 0) return { deleted: true };
    return { deleted: false };
  }
}
