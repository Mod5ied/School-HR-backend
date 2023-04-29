// import { RefreshToken } from "../tokens/models/refreshtokens.model";
import { AccessToken } from "../tokens/models/accesstokens.model";
import { REFRESH_SECRET } from "../tokens/tokens.secrets";
import { IToken } from "../tokens/tokens.types";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common"
import { Model } from "mongoose";
import CryptoJS from "crypto-js";

@Injectable()
export class CryptService {
  constructor(
    @InjectModel(AccessToken.name)
    private readonly accessTokens: Model<IToken>,
    // @InjectModel(RefreshToken.name)
    // private readonly refreshTokens: Model<IToken>
  ) { }

  /** Returns token encrypted with aes-256 algo. */
  public async encryptToken(token: string) {
    /* encrypt the jwt return */
    const encrypted = CryptoJS.AES.encrypt(token, REFRESH_SECRET);
    return encrypted.toString();
  }

  /** Returns decrypted tokens. */
  public async decryptTokens(encryptedToken: string, email: string) {
    /* decrypts the token and returns true if it matches unhashed token */
    const accessDoc = await this.accessTokens.findOne({ tokenEmail: email }).lean();
    if (!accessDoc) throw new Error('Token is expired!');

    const decrypted = CryptoJS.AES.decrypt(encryptedToken, REFRESH_SECRET).toString();
    if (decrypted === accessDoc.token) return { match: true, doc: accessDoc };
    return { match: false };
  }
}