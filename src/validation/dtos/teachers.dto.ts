export class CreateTeacherDto {
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public school: string
    public salary: string
    public email: string
    public subjects: Array<string>
}
export class UpdateTeacherDto {
    public phoneNumber: string | undefined
    public firstName: string | undefined
    public lastName: string | undefined
    public school: string | undefined
    public salary: string | undefined
    public subjects: undefined | Array<string>
}

export class CreateSubjectsDto {
    public body: Array<string>
    public teacherId: string
    public encryptionKey: string
}

interface Test {
    date: Date
    class: string
    subject: string
    teacherId: string
}

export class CreateTestDto {
    public body: Test
    public encryptionKey: string
}