import { TokensSuccess, Users } from 'src/services/tokens/tokens.types';

export type ITokensOk = TokensSuccess;

export interface ITokensErr {
  ok: boolean;
  code: number;
  error: string;
  metadata?: {
    message: string;
    stack?: string;
  };
}

export interface IEntityOk {
  ok: boolean;
  page_limit: number;
  entity: [Users];
}

export type IEntityErr = ITokensErr
