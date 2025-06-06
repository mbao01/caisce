declare namespace Express {
  interface User {
    id: string;
    email: string;
    refreshToken?: string;
  }

  interface Session {
    sid?: string | null;
    cookie: {
      maxAge?: number;
      expires?: Date | null;
      [key: string]: any;
    };
    passport?: {
      user?: any;
    };
    [key: string]: any;
  }

  interface JwtPayload {
    username: string;
    sub: {
      uid: string;
      sid: string;
    };
  }

  interface Request {
    user?: User | null;
    session?: Session | null;
  }
}
