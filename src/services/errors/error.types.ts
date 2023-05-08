export enum HttpStatusEnum {
  'BAD_REQUEST' = 400,
  'UNAUTHORIZED' = 401,
  'FORBIDDEN' = 403,
  'NOT_FOUND' = 404,
  'GONE' = 410,
  'INTERNAL_SERVER_ERROR' = 500,
  'NOT_IMPLEMENTED' = 501,
}

/** Error return interface  */
export interface IError {
  ok: boolean;
  code: HttpStatusEnum;
  error: string;
  metadata?: {
    messages?: string;
  };
}

// export interface UserService {
//   find: (id: string) => User;
//   insert: (user: Exclude<User, 'id'>) => User;
// }
