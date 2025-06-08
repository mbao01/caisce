declare namespace Express {
  interface User {
    id: string;
    email: string;
    refreshToken?: string;
  }

  interface SessionCookie {
    maxAge: number;
    expires: Date;
    [key: string]: unknown;
  }

  interface Session {
    sid?: string | null;
    cookie: Partial<SessionCookie>;
    passport?: {
      user?: User;
    };
    refresh_token?: string;
    [key: string]: unknown;
  }

  interface JwtPayload {
    username: string;
    sid: string;
    sub: string;
  }

  interface Request {
    user?: User | null;
    session?: Session | null;
  }
}
