import { hash } from "argon2";

export function generateOtp(length = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function hashOtp(otp: string): Promise<string> {
  return  await hash(otp)
}