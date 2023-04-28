import { ACCESS_SECRET, LINK, REFRESH_SECRET, SECRET } from './tokens.secrets';
import { compareTokens, encryptToken } from '../encrypt/tokens.encrypt';
import { ResponseService } from '../broadcast/response/reponse.tokens';
import { RefreshToken } from './models/refreshtokens.model';
import { AccessToken } from './models/accesstokens.model';
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

    private readonly jwtService: JwtService,

    private readonly errorService: ErrorService,

    @InjectModel(AccessToken.name)
    private readonly accessToken: Model<IToken>,

    @InjectModel(RefreshToken.name)
    private readonly refreshToken: Model<IToken>,
  ) { }

  /** create token doc (and exec self-destruct for doc on creation) for the user. */
  private async generateTokenDoc(
    model: Model<IToken>,
    user: Partial<Users>,
    token,
  ) {
    try {
      const { role, email, permissions } = user;
      return await model.create({
        token,
        tokenEmail: email,
        tokenPermissions: permissions,
        role: role,
      });
    } catch (e) {
      return this.errorService.badRequest(e.message);
    }
  }

  private async generateAccessToken(user: Partial<Users>) {
    const { email, role, permissions } = user;
    try {
      const aToken = await this.jwtService.signAsync(
        { email, role, permissions },
        {
          expiresIn: '4h',
          issuer: `${role}-issuer`,
          secret: ACCESS_SECRET,
        },
      );
      await this.generateTokenDoc(this.accessToken, user, aToken);
      return aToken;
    } catch (e) {
      this.errorService.badRequest(
        `Failed to create AccessToken_Doc, where error - ${e.message}`,
      );
    }
  }

  private async generateRefreshToken(user: Partial<Users>) {
    const { email, role, permissions } = user;
    try {
      const rToken = await this.jwtService.signAsync(
        { email, role, permissions },
        {
          issuer: `${role}-issuer`,
          secret: REFRESH_SECRET,
        },
      );
      await this.generateTokenDoc(this.refreshToken, user, rToken);
      return rToken;
    } catch (e) {
      this.errorService.badRequest(
        `Failed to create RefreshToken_Doc, where error - ${e.message}`,
      );
    }
  }

  public async generateTokens({ email, permissions, role }) {
    try {
      const accessToken = await this.generateAccessToken({
        email,
        role,
        permissions,
      });
      const hashedToken = await encryptToken(accessToken);
      await this.generateRefreshToken({ email, role, permissions });
      const vLink = `${LINK}verify/?token=${hashedToken}/?email=${email}`;

      const emailContent = `
      <form action="\${vLink}" method="POST">
        <button type="submit" onclick="verify()">Go to homepage</button>
      </form>
      `;
      return this.responseService.respondToEmail(hashedToken, {
        to: email,
        from: SECRET.email,
        subject: SECRET.subject,
        html: emailContent
      });
    } catch (jwtErr) {
      return this.errorService.badRequest(jwtErr.message);
    }
  }

  public async runVerifyAccessToken(token: string, email: string) {
    try {
      const tokenDoc = await this.accessToken.findOne({ tokenEmail: email }).lean()
      if (!tokenDoc) return this.errorService.unauthorizedRequest('Token is expired!')

      const validToken = await compareTokens(tokenDoc.token, token);
      if (validToken.ok)
        return this.responseService.respondToClient(token, { role: tokenDoc.role, permissions: tokenDoc.tokenPermissions });

      return this.errorService.unauthorizedRequest('Token is invalid');
    } catch (e) {
      return this.errorService.badRequest(e.message);
    }
  }
}
