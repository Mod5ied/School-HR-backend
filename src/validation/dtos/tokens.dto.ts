
export class TokensDto {
    public email?: string
    public verified?: boolean
    public encryptionKey: string
    public ok: boolean | true
    public token: string
    public role: string
    public phoneNumber: string
    public permissions: {
        read: boolean | true
        write: true
        writeOwn: true
    }
}