export class CreateAdmin {
    public email: string
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public role: string
}

export class FetchAdmin {
    public email: string
    public phoneNumber: string
    public firstName: string
    public lastName: string
    public role: string
}

export class LoginAdmin {
    public email: string
    public phoneNumber: string
    public role: string
}

export class LogoutAdmin {
    public email: string
    public phoneNumber: string
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
    public email: string
}

export class PermissionsDto {
    public encryptionKey: string
    public phoneNumber: string
    public email: string | undefined
    public role: string
    public updateBody: {
        read: true,
        write: boolean,
        writeOwn: boolean
    }
}

export class UpdateAdmin {
    public encryptionKey: string
    public phoneNumber: string
    public email: string
    public role: string
    public updateBody: {
        email: string, phoneNumber: string, 
        firstName: string | undefined, 
        lastName: string | undefined
    }
}

export class DeleteAdmin {
    public encryptionKey: string
    public phoneNumber: string
    public email: string | undefined
    public role: string
}