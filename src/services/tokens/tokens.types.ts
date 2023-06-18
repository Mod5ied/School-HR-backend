import { Teacher } from 'src/entity/primary_entities/staff/teachers/teachers.model';
import { Student } from 'src/entity/primary_entities/students/students.models';
import { Bursary } from 'src/entity/primary_entities/staff/bursary/busary.model';

/* tokens type def. */
type Permissions = {
  read: boolean;
  write: boolean;
};

export interface TokensSuccess {
  ok: boolean;
  code: number;
  metadata: {
    data: string | { accessToken: string; refreshToken?: string | undefined };
  };
}

export interface IToken {
  regNum: string | undefined;
  role: string;
  token: string;
  tokenEmail: string;
  tokenPermissions: Permissions | any;
}

/* users type def. */
export type Users = Student & Teacher & Bursary
