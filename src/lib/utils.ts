import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { compare, hash } from "bcryptjs";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export async function comparePasswords(plainPass: string, hashedPass: string) {
  return compare(plainPass, hashedPass);
}
