import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { SessionService } from "@/session/session.service";
import { UsersService } from "@/domains/users/users.service";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private sessionService: SessionService,
    private usersService: UsersService
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

    let foundUser = await this.usersService.getUser({
      id: payload.sub,
      email: payload.username,
    });

    if (!foundUser) {
      throw new InternalServerErrorException("Could not find user");
    }

    const user = {
      id: foundUser.id,
      email: payload.username,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      picture: foundUser.picture,
    };

    return user;
  }
}
