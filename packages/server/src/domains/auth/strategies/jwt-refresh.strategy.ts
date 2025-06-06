import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET") as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Express.JwtPayload): Promise<Express.User> {
    const authorizationHeader = req.get("Authorization") as string;
    const refreshToken = authorizationHeader?.replace("Bearer", "").trim();

    return {
      id: payload.sub?.uid,
      email: payload.username,
      refreshToken,
    };
  }
}
