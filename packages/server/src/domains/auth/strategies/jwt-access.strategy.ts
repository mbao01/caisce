import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { SessionService } from "@/session/session.service";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private sessionService: SessionService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET") as string,
    });
  }

  async validate(req: Request, payload: Express.JwtPayload): Promise<Express.User> {
    const sessionId = this.sessionService.getSessionId(req);

    if (!sessionId) {
      throw new ForbiddenException(
        "This is a protected resource and you must access it accordingly"
      );
    }

    if (sessionId !== payload.sid) {
      throw new ForbiddenException("You are not authenticated to access this resource");
    }

    return {
      id: payload.sub,
      email: payload.username,
    };
  }
}
