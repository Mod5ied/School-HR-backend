import * as bcrypt from 'bcrypt';

export async function encryptPassword(password: string) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  if (!isMatch) return { ok: false };
  return { ok: true };
}

// export function spitEncryptionKey(secret: string) {
//   return bcrypt.hashSync(secret, 10)
// }

// export async function compareEncryptKey(localKey: string, requestKey: string) {
//   return await bcrypt.compare(requestKey, localKey)
// }