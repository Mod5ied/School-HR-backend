export class CreateDirector {
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public school: string
    public email: string
    public gender: string
    public address: string
    public role: string
}

export class FetchDirector {
    public phoneNumber: string
    public email: string
    public role: string
    public range?: {
        end: number | undefined
        start: number,
    } | undefined
}

export class LoginDirector {
    public email: string
    public phoneNumber: string
    public school: string
    public role: string
}

export class LogoutDirector {
    public encryptionKey: string
    public phoneNumber: string
    public email: string
    public role: string
}

export class TokenVerify {
    public email: string
    public role: string
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
        read: true,
        write: boolean,
        writeOwn: boolean,
    }
}

export class UpdateDirector {
    public encryptionKey: string
    public phoneNumber: string
    public email?: string
    public role: string
    public updateBody: {
        phoneNumber: string,
        firstName: string | undefined,
        lastName: string | undefined,
        school: string | undefined,
        email: string | undefined,
        gender: string | undefined,
        address: string | undefined,
        staffTotal: number | undefined
    }
}

export class DeleteDirector {
    public encryptionKey: string
    public phoneNumber: string
    public email: string | undefined
    public role: string
}