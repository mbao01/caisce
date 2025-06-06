import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SessionService } from "@/session/session.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private configService: ConfigService,
    private sessionService: SessionService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET") as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Express.JwtPayload): Promise<Express.User> {
    const sessionId = this.sessionService.getSessionId(req);

    if (!sessionId) {
      throw new ForbiddenException(
        "This is a protected resource and you must access it accordingly"
      );
    }

    if (sessionId !== payload.sub?.sid) {
      throw new ForbiddenException("You are not authenticated to access this resource");
    }

    const authorizationHeader = req.get("Authorization") as string;
    const refreshToken = authorizationHeader?.replace("Bearer", "").trim();

    return {
      id: payload.sub?.uid,
      email: payload.username,
      refreshToken,
    };
  }
}
