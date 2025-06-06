import { Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as cookie from "cookie";
import { CacheService } from "@/cache/cache.service";
import { SESSION_KEY_PREFIX, COOKIE_NAME, COOKIE_OPTIONS, SESSION_TTL } from "./session.constant";

interface SessionData {
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

@Injectable()
export class SessionService {
  // Hold session state per request lifecycle
  private sessions = new WeakMap<Request, SessionData>();

  constructor(private cacheService: CacheService) {}

  #initSession(req: Request) {
    // New session: initialize with empty data and default cookie
    let sid: string | undefined;
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookie.parse(cookieHeader);
      sid = cookies[COOKIE_NAME];
    }

    const session = {
      sid,
      cookie: {
        // we do not want session expiring before cookie so, max age is 1 minute behind session expiration.
        maxAge: SESSION_TTL - 60 * 1000,
        expires: null,
      },
    };

    this.sessions.set(req, session);

    return session;
  }

  #getCacheKey(sid: string) {
    return `${SESSION_KEY_PREFIX}${sid}`;
  }

  // Get session ID from request cookies
  #getSessionId(req: Request): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = cookie.parse(cookieHeader);

    return cookies[COOKIE_NAME] || null;
  }

  async #setSession(session: SessionData, res: Response) {
    const maxAge = session.cookie.maxAge ?? SESSION_TTL - 60 * 1000;

    if (!session.sid) {
      session.sid = uuidv4();

      const expires = session.cookie.expires
        ? new Date(session.cookie.expires)
        : new Date(Date.now() + maxAge);

      // Set cookie on response
      const cookieStr = cookie.serialize(COOKIE_NAME, session.sid, {
        ...COOKIE_OPTIONS,
        maxAge,
        expires,
      });

      res.setHeader("Set-Cookie", cookieStr);
    }

    // Store session in Redis
    const cacheKey = this.#getCacheKey(session.sid);
    await this.cacheService.set(cacheKey, session, SESSION_TTL);

    return session;
  }

  // Load session from store, or create new empty session
  async loadSession(req: Request): Promise<SessionData> {
    let session: SessionData | undefined | null = this.sessions.get(req);
    if (session) {
      return session;
    }

    const sid = this.#getSessionId(req);
    if (!sid) {
      return this.#initSession(req);
    }

    const cacheKey = this.#getCacheKey(sid);
    session = await this.cacheService.get<SessionData>(cacheKey);

    if (!(session?.cookie && session?.sid)) {
      return this.#initSession(req);
    }

    return session;
  }

  async createSession(res: Response, user?: any) {
    const maxAge = SESSION_TTL - 60 * 1000;
    const session: SessionData = {
      cookie: {
        maxAge,
        expires: new Date(Date.now() + maxAge),
      },
    };

    if (user) {
      session.passport = { user };
    }

    const { sid } = await this.#setSession(session, res);

    return { sid };
  }

  // Save session to store if changed
  async saveSession(req: Request, res: Response): Promise<void> {
    const session = this.sessions.get(req);
    if (!session) return;

    await this.#setSession(session, res);
  }

  // Destroy session
  async destroySession(req: Request, res: Response): Promise<void> {
    const sid = this.#getSessionId(req);
    if (sid) {
      const cacheKey = this.#getCacheKey(sid);
      await this.cacheService.del(cacheKey);
    }
    this.sessions.delete(req);
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(COOKIE_NAME, "", {
        ...COOKIE_OPTIONS,
        maxAge: 0,
      })
    );
  }

  // Convenience getter/setter for session data on request
  async get(req: Request, key: string): Promise<any> {
    const session = await this.loadSession(req);
    return session[key];
  }

  async set(req: Request, key: string, value: any): Promise<void> {
    const session = await this.loadSession(req);
    session[key] = value;
  }

  // Helpers for passport user
  async getUser(req: Request): Promise<any> {
    const session = await this.loadSession(req);
    return session.passport?.user ?? null;
  }

  async setUser(req: Request, user: any): Promise<void> {
    const session = await this.loadSession(req);
    if (!session.passport) session.passport = {};
    session.passport.user = user;
  }
}
