declare namespace Express {
  interface User {
    id: string;
    email: string;
  }

  interface Request {
    user?: User;
  }
}
