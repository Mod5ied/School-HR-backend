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
