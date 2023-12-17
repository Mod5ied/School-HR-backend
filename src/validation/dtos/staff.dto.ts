export class CreateTeacherDto {
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public school: string
    public salary: string
    public email: string
    public subjects: Array<string>
}

export class CreateBursarDto {
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public school: string
    public salary: string
    public email: string
    public dateOfBirth: Date
    public maritalStatus: string
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
    public role: string
}

export class TokenVerify {
    public role: string
    public email: string
    public token: string
    public phoneNumber: string
}

export class OtpVerify {
    public otp: number
    public role: string
    public phoneNumber: string
    public email?: string
}

export class PermissionsDto {
    public encryptionKey: string
    public phoneNumber: string
    public email?: string | undefined
    public role: string
    public updateBody: {
        read: true
        write: boolean
        writeOwn: boolean
    }
}

export class FetchStaffDto {
    public phoneNumber: string
    public email: string
    public role: string
    public range?: {
        start: number,
        end: number | undefined
    } | undefined
}

export class UpdateStaffDto {
    public encryptionKey: string
    public phoneNumber: string
    public email?: string
    public role: string
    public updateBody: {
        phoneNumber: string
        firstName: string | undefined
        lastName: string | undefined
        school: string | undefined
        salary: string | undefined
        subjects: Array<string> | undefined
        role: string
        email?: string
        maritalStatus?: string | undefined
    }
}

export class DeleteStaffDto {
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
    public email?: string
    public role: string
    public updateBody: {
        subject: Array<string>
    }
}