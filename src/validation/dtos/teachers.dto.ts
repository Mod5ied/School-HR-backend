export class FetchTeachersDto {
    public phoneNumber: string
    public email: string
    public role: string
    public range: {
        start: number,
        end: number | undefined
    }
}

export class CreateTeacherDto {
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public school: string
    public salary: string
    public email: string
    public subjects: Array<string>
}

export class LogoutDto {
    public encryptionKey: string
    public phoneNumber: string
    public email?: string
    public regNumber?: string
    public school?: string
    public role: string
}

export class LoginDto {
    public email?: string
    public school: string
    public phoneNumber: string
}

export class TokenVerify {
    public email: string
    public token: string
}

export class OtpVerify {
    public otp: number
    public phoneNumber: string
    public email?: string
}

export class PermissionsDto {
    public encryptionKey: string
    public phoneNumber: string
    public email?: string | undefined
    public status: {
        read: true
        write: boolean
        writeOwn: boolean
    }
}

export class UpdateTeacherDto {
    public encryptionKey: string
    public phoneNumber: string
    public firstName: string | undefined
    public lastName: string | undefined
    public school: string | undefined
    public salary: string | undefined
    public subjects: Array<string> | undefined
    public role: string
    public email?: string
}

export class DeleteTeacherDto {
    public encryptionKey: string
    public phoneNumber: string
    public email: string | undefined
    public role: string
}

export class CreateSubjectsDto {
    public body: Array<string>
    public teacherId: string
    public encryptionKey: string
}

export class UpdateSubjectDto {
    public phoneNumber: string
    public encryptionKey: string
    public subject: Array<string>
    public email?: string
    public role: string
}