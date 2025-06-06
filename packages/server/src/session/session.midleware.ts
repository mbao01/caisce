// session/session.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { SessionService } from "./session.service";

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Attach user to req.user (for passport compatibility)
    req.session = await this.sessionService.getSession(req);

    next();
  }
}
