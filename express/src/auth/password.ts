import argon2 from "argon2";

const isProd = process.env.NODE_ENV === "production";
const pepper = process.env.PASSWORD_PEPPER ?? "";

export async function hashPassword(plain: string): Promise<string> {
 
  const toHash = plain + pepper;
  return argon2.hash(toHash, {
    type: argon2.argon2id,
    
    timeCost: isProd ? 3 : 2,
    memoryCost: isProd ? 19456 : 8192,
    parallelism: 1,
  });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const toVerify = plain + pepper;
  return argon2.verify(hash, toVerify);
}
