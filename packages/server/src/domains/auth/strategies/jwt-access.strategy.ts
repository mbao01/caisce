import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET") as string,
    });
  }

  async validate(payload: Express.JwtPayload): Promise<Express.User> {
    return {
      id: payload.sub?.uid,
      email: payload.username,
      // sessionId: payload.sub?.sid,
    };
  }
}
