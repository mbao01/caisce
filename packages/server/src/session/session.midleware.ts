// session/session.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { SessionService } from "./session.service";

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Load or initialize session on request
    await this.sessionService.loadSession(req);

    // Attach user to req.user (for passport compatibility)
    req.user = await this.sessionService.getUser(req);

    next();
  }
}
