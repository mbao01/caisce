export const ONE_MINUTE = 60 * 1000;
export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const COOKIE_MAX_AGE = Number(process.env.COOKIE_MAX_AGE);
export const SESSION_KEY_PREFIX = process.env.SESSION_KEY_PREFIX as string;
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: true, // set true if HTTPS
  path: "/",
} as const;
