// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ACCESS_SECRET, LINK, REFRESH_SECRET, SECRET } from './tokens.secrets';
import { ResponseService } from '../broadcast/response/reponse.tokens';
import { RefreshToken } from './models/refreshtokens.model';
import { AccessToken } from './models/accesstokens.model';
import { CryptService } from '../encrypt/tokens.encrypt';
import { ErrorService } from '../errors/error.service';
import { IToken, Users } from './tokens.types';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt/dist';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class TokenService {
  constructor(
    private readonly responseService: ResponseService,

    private readonly cryptService: CryptService,

    private readonly errorService: ErrorService,

    private readonly jwtService: JwtService,

    @InjectModel(AccessToken.name)
    private readonly accessToken: Model<IToken>,

    @InjectModel(RefreshToken.name)
    private readonly refreshToken: Model<IToken>,
  ) { }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private buildVerificationLink(email: string, hashedToken: string): string {
    return `\${LINK}verify/?token=\${hashedToken}/?email=\${email}`;
  }

  private buildEmailContent(vLink: string): string {
    return `
      <form action="\\${vLink}" method="POST">
        <button type="submit" onclick="verify()">Go to homepage</button>
      </form>
    `;
  }

  /** create token doc (and exec self-destruct for doc on creation) for the user. */
  private async generateTokenDoc(model: Model<IToken>, user: Partial<Users>, token: string) {
    const { role, email, permissions } = user;
    return await model.create({
      token,
      tokenEmail: email,
      tokenPermissions: permissions,
      role: role,
    }).catch(error => {
      return this.errorService.badRequest(`AccessToken-Doc creation failed! - ${error.message}`);
    })
  }

  /** returns an encrypted jwt and the original saved to an access-token doc.  */
  private async generateAccessToken(user: Partial<Users>) {
    const { email, role, permissions } = user;
    const accessToken = await this.jwtService.signAsync(
      { email, role, permissions },
      {
        expiresIn: '4h',
        issuer: `${role}-issuer`,
        secret: ACCESS_SECRET,
      },
    ).catch(error => {
      throw new Error(`AccessToken creation failed! - ${error.message}`);
    })
    await this.generateTokenDoc(this.accessToken, user, accessToken);
    return this.cryptService.encryptToken(accessToken);
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
      throw new Error(`RefreshToken creation failed! - ${error.message}`);
    })
    await this.generateTokenDoc(this.refreshToken, user, refreshToken);
  }

  public async generateTokens({ email, permissions, role }) {
    const hashedToken = await this.generateAccessToken({ email, permissions, role });
    await this.generateRefreshToken({ email, permissions, role });
    const vLink = this.buildVerificationLink(email, hashedToken);
    const emailContent = this.buildEmailContent(vLink);

    return this.responseService.respondToEmail(hashedToken, {
      to: email,
      from: SECRET.email,
      subject: SECRET.subject,
      html: emailContent
    }).catch(error => {
      return this.errorService.badRequest(error.message);
    })
  }

  public async runVerifyAccessToken(token: string, email: string) {

    const validToken = await this.cryptService.decryptTokens(token, email);
    if (validToken.match)
      return this.responseService.respondToClient(token, {
        role: validToken.doc.role, permissions: validToken.doc.tokenPermissions
      });

    return this.errorService.unauthorizedRequest('Token verification failed - Invalid token');
  }
}