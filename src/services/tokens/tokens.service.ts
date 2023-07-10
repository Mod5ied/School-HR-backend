// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { ACCESS_SECRET, ENCRYPT_SECRET, LINK, REFRESH_SECRET, SECRET } from './tokens.secrets'
import { ResponseService } from '../broadcast/response/response.services'
import { IToken, TokenDoc, UserEncrypt, Users } from './tokens.types'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { RefreshToken } from './models/refreshtokens.model'
import { AccessToken } from './models/accesstokens.model'
import { CacheService } from '../cache/cache.service'
import { InjectModel } from '@nestjs/mongoose'
import { JwtService } from '@nestjs/jwt/dist'
import { Model } from 'mongoose'

@Injectable()
export class TokenService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: CacheService,
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

  /** `generateTokenDoc` create token doc (and deletes the doc after 5-minutes) for the user. */
  private async generateTokenDoc(model: Model<IToken>, user: Partial<Users>, token: string) {
    const { email, permissions, role } = user
    await model.create({ token, tokenEmail: email, tokenPermissions: permissions, role }
    ).catch(error => {
      throw new BadRequestException(`AccessToken-Doc creation failed! - ${error.message}`)
    })
    return this.eventEmitter.emit('delete-tokenDoc', { model, user });
  }
  @OnEvent("delete-tokenDoc")
  async deleteTokenDoc(payload: TokenDoc) {
    const { model, user: { email, phoneNumber } } = payload;
    setTimeout(async () => {
      await model.deleteMany({ $or: [{ tokenEmail: email }, { phoneNumber }] })
    }, 300000);
  }

  /** `generateAccessToken` creates a jwt (which self-destructs in 5-mins) and also saves it to an access-token doc.  */
  private async generateAccessToken(user: Partial<Users>) {
    /* delete access-token doc b4 creating one. */
    await this.accessToken.deleteMany({ $or: [{ tokenEmail: user.email }, { phoneNumber: user.phoneNumber }] });
    const { email, role, permissions } = user
    const accessToken = await this.jwtService.signAsync(
      { email, role, permissions },
      { expiresIn: '300', secret: ACCESS_SECRET },
    ).catch(error => {
      throw new Error(`AccessToken creation failed! - ${error.message}`)
    })
    await this.generateTokenDoc(this.accessToken, user, accessToken)
    return accessToken;
  }

  /** `generateRefreshToken` creates a jwt (which self-destructs in 20-hrs) and creates a ref-token doc using the token.  */
  private async generateRefreshToken(user: Partial<Users>) {
    const { email, role, permissions } = user;
    const refreshToken = await this.jwtService.signAsync(
      { email, role, permissions },
      { expiresIn: "20h", secret: REFRESH_SECRET },
    ).catch(error => {
      throw new Error(`RefreshToken creation failed! - ${error.message}`)
    })
    await this.generateTokenDoc(this.refreshToken, user, refreshToken)
  }

  /** `generateTokens` generates access-token and sends encrypted link to client-email  */
  /* note that i returned the hashed-token so we can see what gets attached to the email thats sent. */
  /* the only return value here should be a 'tokenized-email'. */
  public async generateTokens(user: Partial<Users>) {
    const [hashedAccessToken, /* voidRefToken */] = await Promise.all([
      await this.generateAccessToken(user),
      await this.generateRefreshToken(user)
    ])
    const vLink = this.buildVerificationLink(user.email, hashedAccessToken)
    const emailContent = this.buildEmailContent(vLink)

    this.eventEmitter.emit("cache-accessToken", { user, hashedAccessToken })
    return { hashedAccessToken, emailContent }
    // return this.responseService.respondViaEmail({
    //   to: user.email,
    //   from: SECRET.email,
    //   subject: SECRET.subject,
    //   html: emailContent
    // })
  }
  /** store the access-token to cache after 10 second of creating, with ttl of 8-hrs. */
  @OnEvent("cache-accessToken")
  async cacheAccessToken(payload: UserEncrypt) {
    const { user, hashedAccessToken } = payload;
    setTimeout(async () =>
      await this.cacheService.setCache(`${user.phoneNumber}-accessToken`, hashedAccessToken, 28800), 10000);
  }

  /** generates an encryption key (with 8-hr ttl) and caches it(after 5-mins). Called at log-in. */
  public async generateEncryptedKeys(user: Partial<Users>) {
    const encryptedKey = await this.jwtService.signAsync({ permission: user.permissions },
      { secret: ENCRYPT_SECRET, expiresIn: '8h' });
    this.eventEmitter.emit("cache-encryptedKey", { encryptedKey, user });
    return encryptedKey;
  }
  @OnEvent('cache-encryptedKey')
  async cacheEncryptedKey(payload: UserEncrypt) {
    const { encryptedKey, user } = payload;
    setTimeout(async () => await this.cacheService.setCache(`${user.phoneNumber}-encryptedKey`, encryptedKey, 28800), 10000);
  }

  /** `validateEmailLoginToken` verifies access-ciphers(email-bourne) and responds to client. */
  public async validateEmailLoginToken(token: string, email: string, phoneNumber: string) {
    const tokenDoc = await this.accessToken.findOne({ $or: [{ phoneNumber }, { tokenEmail: email }] }).lean();
    if (!tokenDoc) throw new NotFoundException('Cipher not found or expired!');
    const user = { phoneNumber, email, permissions: tokenDoc.tokenPermissions, role: tokenDoc.role };
    const encryptedKey = await this.generateEncryptedKeys(user);
    return this.responseService.verifiedResponse(token, encryptedKey, {
      role: tokenDoc.role, permissions: tokenDoc.tokenPermissions, phoneNumber
    })
  }

  /** verifies access-tokens(with regNumber or email).  */
  public async verifyAccessToken(token: string, user: { role: string }) {
    const USERS = ["director", "staff", "student"];
    if (USERS.includes(user.role)) {
      try {
        return this.jwtService.verifyAsync(token, { secret: ACCESS_SECRET }) && true
      } catch (error) {
        throw new UnauthorizedException(`AccessToken verification failed - ${user.role}`);
      }
    }
    else throw new UnauthorizedException("EncryptedKey validation failed - Invalid role!")
  }

  /** verifies encryption keys. Called by POST & UPDATE ops. */
  public async verifyEncryptedKeys(key: string, role: string) {
    const USERS = ["director", "staff", "student"];
    if (USERS.includes(role)) {
      try {
        return await this.jwtService.verifyAsync(key, { secret: ENCRYPT_SECRET }) && true
      } catch (error) {
        throw new UnauthorizedException(`EncryptedKey validation failed - ${role}`);
      }
    }
    else throw new UnauthorizedException("EncryptedKey validation failed - Invalid role!");
  }

  /** `nullifyTokens` is called when client prematurely logs out of system.  */
  public async nullifyTokens(user: Partial<Users>) {
    const { email, phoneNumber, regNumber } = user;
    const [aTokenDeleted, rTokenDeleted] = await Promise.all([
      this.accessToken.deleteMany({ $or: [{ tokenEmail: email }, { phoneNumber }, { regNum: regNumber }] }),
      this.refreshToken.deleteMany({ $or: [{ tokenEmail: email }, { phoneNumber }, { regNum: regNumber }] })
    ])
    return { aTokenDeleted, rTokenDeleted }
  }
}