// import { RefreshToken } from "../tokens/models/refreshtokens.model";
import { AccessToken } from "../tokens/models/accesstokens.model";
import { Injectable, NotFoundException } from "@nestjs/common"
import { REFRESH_SECRET } from "../tokens/tokens.secrets";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import CryptoJS from "crypto-js";

@Injectable()
export class CryptService {
  constructor(
    @InjectModel(AccessToken.name) private readonly accessTokens: Model<AccessToken>,
    // @InjectModel(RefreshToken.name) private readonly refreshTokens: Model<IToken>
  ) { }

  /** `encryptToken` returns token encrypted with aes-256 algo. */
  public async encryptToken(token: string) {
    /* encrypt the jwt return */
    const encrypted = CryptoJS.AES.encrypt(token, REFRESH_SECRET);
    return encrypted.toString();
  }

  /** `decryptTokens` returns decrypted tokens */
  public async decryptTokens(encryptedToken: string) {
    /* decrypts the token and returns true if it matches un-hashed token */
    const decrypted = CryptoJS.AES.decrypt(encryptedToken, REFRESH_SECRET).toString();
    if (decrypted) return decrypted;
    return false;
  }

  /** `decryptTokensStaff` returns decrypted tokens, (specific to verifying Staff entities.) */
  public async decryptTokensStaff(encryptedToken: string, phoneNumber: string) {
    /* decrypts the token and returns true if it matches un-hashed token */
    const token = await this.accessTokens.findOne({ phoneNumber }).lean();
    if (!token) throw new NotFoundException('Staff Token not found/expired! - (@decryptTokenStaff)');

    const decrypted = CryptoJS.AES.decrypt(encryptedToken, REFRESH_SECRET).toString();
    if (decrypted === token.token) return { match: true, doc: token };
    return { match: false };
  }

  /** `decryptTokensStudents` returns decrypted tokens, (specific to verifying Students entities.) */
  public async decryptTokensStudents(encryptedToken: string, regNum: string) {
    /* decrypts the token and returns true if it matches un-hashed token */
    const token = await this.accessTokens.findOne({ regNum }).lean();
    if (!token) throw new NotFoundException('Student Token not found/expired! - (@decryptTokenStudents)');

    const decrypted = CryptoJS.AES.decrypt(encryptedToken, REFRESH_SECRET).toString();
    if (decrypted === token.token) return { match: true, doc: token };
    return { match: false };
  }
}