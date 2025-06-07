import { Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as cookie from "cookie";
import { CacheService } from "@/cache/cache.service";
import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  ONE_MINUTE,
  SESSION_KEY_PREFIX,
} from "./session.constant";

@Injectable()
export class SessionService {
  constructor(private cacheService: CacheService) {}

  #getCacheKey(sessionId: string) {
    return `${SESSION_KEY_PREFIX}${sessionId}`;
  }

  // Get session ID from request cookies
  getSessionId(req: Request): string | null {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookie.parse(cookieHeader);

    return cookies[COOKIE_NAME] || null;
  }

  async #setSession(session: Express.Session, res: Response) {
    const { maxAge, expires } = session.cookie as Express.SessionCookie;

    let sessionId = session.sid;
    if (!sessionId) {
      sessionId = uuidv4();

      // Set cookie on response
      const cookieStr = cookie.serialize(COOKIE_NAME, sessionId, {
        ...COOKIE_OPTIONS,
        maxAge,
        expires,
      });

      res.setHeader("Set-Cookie", cookieStr);
    }

    // Store session in Redis
    const newSession = { ...session, sid: sessionId };
    const cacheKey = this.#getCacheKey(sessionId);
    await this.cacheService.set(cacheKey, newSession, maxAge + ONE_MINUTE);

    return newSession;
  }

  // Get session from store, or create new empty session
  async getSession(req: Request): Promise<Express.Session | null> {
    const sessionId = this.getSessionId(req);

    if (!sessionId) {
      return null;
    }

    const cacheKey = this.#getCacheKey(sessionId);
    const session = await this.cacheService.get<Express.Session>(cacheKey);

    return session;
  }

  async createSession(res: Response, user?: any) {
    const maxAge = COOKIE_MAX_AGE;
    const session: Express.Session = {
      cookie: {
        maxAge,
        expires: new Date(Date.now() + maxAge),
      },
    };

    if (user) {
      session.passport = { user };
    }

    const { sid: sessionId } = await this.#setSession(session, res);

    return { sessionId };
  }

  // Destroy session
  async destroySession(req: Request, res: Response): Promise<void> {
    const sessionId = this.getSessionId(req);
    if (sessionId) {
      const cacheKey = this.#getCacheKey(sessionId);
      await this.cacheService.del(cacheKey);
    }
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(COOKIE_NAME, "", {
        ...COOKIE_OPTIONS,
        maxAge: 0,
      })
    );
  }

  async updateSession(
    sessionId: string,
    record: Record<string, unknown>,
    res: Response
  ): Promise<void> {
    const cacheKey = this.#getCacheKey(sessionId);
    let session = await this.cacheService.get<Express.Session>(cacheKey);

    if (session) {
      const ttl = await this.cacheService.ttl(cacheKey);
      const maxAge = ttl ? Math.max(Math.floor(ttl - Date.now()) - ONE_MINUTE, 0) : COOKIE_MAX_AGE;

      session = {
        ...session,
        ...record,
        cookie: {
          maxAge,
          expires: new Date(Date.now() + maxAge),
        },
      };

      await this.#setSession(session, res);
    }
  }
}
