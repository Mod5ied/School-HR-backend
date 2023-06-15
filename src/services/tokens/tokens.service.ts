// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ACCESS_SECRET, ENCRYPT_SECRET, LINK, REFRESH_SECRET, SECRET } from './tokens.secrets'
import { ResponseService } from '../broadcast/response/response.tokens'
import { RefreshToken } from './models/refreshtokens.model'
import { AccessToken } from './models/accesstokens.model'
import { CryptService } from '../encrypt/tokens.encrypt'
import { CacheService } from '../cache/cache.service'
import { IToken, Users } from './tokens.types'
import { InjectModel } from '@nestjs/mongoose'
import { JwtService } from '@nestjs/jwt/dist'
import { Model } from 'mongoose'

@Injectable()
export class TokenService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly cacheService: CacheService,
    private readonly cryptService: CryptService,
    private readonly jwtService: JwtService,
    @InjectModel(AccessToken.name) private readonly accessToken: Model<IToken>,
    @InjectModel(RefreshToken.name) private readonly refreshToken: Model<IToken>,
  ) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private buildVerificationLink(email: string, hashedToken: string): string {
    return `\${LINK}verify?token=\${hashedToken}&email=\${email}`;
  }

  private buildEmailContent(vLink: string): string {
    return `
      <form action="\\${vLink}" method="POST">
        <button type="submit" onclick="verify()">Go to homepage</button>
      </form>
    `
  }

  /** create token doc (and exec self-destruct for doc on creation) for the user. */
  private async generateTokenDoc(model: Model<IToken>, user: Partial<Users>, token: string) {
    const { email, permissions, role } = user
    return await model.create({
      token,
      tokenEmail: email,
      tokenPermissions: permissions,
      role: role,
    }).catch(error => {
      throw new BadRequestException(`AccessToken-Doc creation failed! - ${error.message}`)
    })
  }

  /** returns an encrypted jwt and the original saved to an access-token doc.  */
  private async generateAccessToken(user: Partial<Users>) {
    const { email, role, permissions } = user
    const accessToken = await this.jwtService.signAsync(
      { email, role, permissions },
      {
        expiresIn: '4h',
        issuer: `${role}-issuer`,
        secret: ACCESS_SECRET,
      },
    ).catch(error => {
      throw new Error(`AccessToken creation failed! - ${error.message}`)
    })
    await this.generateTokenDoc(this.accessToken, user, accessToken)
    return this.cryptService.encryptToken(accessToken)
  }

  /** generates a jwt and creates a ref-token doc using the token.  */
  private async generateRefreshToken(user: Partial<Users>) {
    const { email, role, permissions } = user;
    const refreshToken = await this.jwtService.signAsync(
      { email, role, permissions },
      {
        issuer: `${role}-issuer`,
        secret: REFRESH_SECRET,
      },
    ).catch(error => {
      throw new Error(`RefreshToken creation failed! - ${error.message}`)
    })
    await this.generateTokenDoc(this.refreshToken, user, refreshToken)
  }

  /** generates access-token and sends encrypted link to client-email  */
  public async generateTokens(user: Partial<Users>) {
    if (await this.accessToken.findOne({ tokenEmail: user.email }).lean())
      throw new BadRequestException("Tokens already exists!")

    const [hashedAccessToken, _] = await Promise.all([
      await this.generateAccessToken(user),
      await this.generateRefreshToken(user)
    ])

    //todo: find out the default "ttl" for redis. Set the ttl here to 8-hours.
    await this.cacheService.setCache('access-token', hashedAccessToken)
    const vLink = this.buildVerificationLink(user.email, hashedAccessToken)
    const emailContent = this.buildEmailContent(vLink)

    return { hashedAccessToken, emailContent }
    // return this.responseService.respondViaEmail({
    //   to: user.email,
    //   from: SECRET.email,
    //   subject: SECRET.subject,
    //   html: emailContent
    // })
  }

  /** method is called when client prematurely logs out of system.  */
  public async nullifyTokens(user: Partial<Users>) {
    const [aTokenDeleted, rTokenDeleted] = await Promise.all([
      this.accessToken.deleteOne({ tokenEmail: user.email }),
      this.refreshToken.deleteOne({ tokenEmail: user.email })
    ])
    return { aTokenDeleted, rTokenDeleted }
  }

  /** verifies access-tokens and responds to client.  */
  public async verifyAccessToken(token: string, email: string) {
    const validToken = await this.cryptService.decryptTokens(token, email)
    // if (!validToken.match) throw new UnauthorizedException('Token verification failed - Invalid token')
    if (!validToken.match) return null
    /* throw the error from the interceptor. */

    return this.responseService.respondToClient(token, {
      role: validToken.doc.role, permissions: validToken.doc.tokenPermissions
    })
  }

  /** generates an encryption key and caches it. Called at log-in. */
  public async generateEncryptedKeys(user: Partial<Users>) {
    const key = await this.cacheService.getCached('encryptedKey')
    if (key) return key

    const encryptedKey = this.jwtService.sign({ role: user.role, permission: user.permissions },
      { secret: ENCRYPT_SECRET })
    //todo: to set cache to a max life of 8 hours.
    encryptedKey && await this.cacheService.setCache('encryptedKey', encryptedKey)
    return encryptedKey
  }

  /** verifies encryption keys and clears it from cache. Called by POST & UPDATE ops. */
  public async verifyEncryptedKeys(requestKey: string) {
    const result = await this.jwtService.verifyAsync(requestKey, { secret: ENCRYPT_SECRET })
    console.log("verify-encrypted-key result: ", result);
    if (!result) return null

    try {
      await this.cacheService.delCached('encryptedKey');
      return true;
    } catch (error) {
      /* log the error in details, then proceed to cache again. */
      await this.cacheService.delCached('encryptedKey');
    }
  }
}