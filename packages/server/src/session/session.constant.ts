export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const SESSION_KEY_PREFIX = process.env.SESSION_KEY_PREFIX as string;
export const SESSION_TTL = Number(process.env.SESSION_TTL);
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: true, // set true if HTTPS
  path: "/",
} as const;
