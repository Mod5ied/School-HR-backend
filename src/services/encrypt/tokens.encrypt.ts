import * as bcrypt from 'bcrypt';

export async function encryptToken(token: string) {
  const salt = await bcrypt.genSalt(15);
  return await bcrypt.hash(token, salt);
}

export async function compareTokens(token: string, hashedToken: string) {
  const isMatch = await bcrypt.compare(token, hashedToken);
  if (!isMatch) return { ok: false };
  return { ok: true };
}
