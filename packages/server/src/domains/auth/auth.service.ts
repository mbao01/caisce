import * as argon2 from "argon2";
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CredentialDto, credentialSchema } from "./schema/login.schema";
import { SessionService } from "@/session/session.service";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private usersService: UsersService
  ) {}

  async updateRefreshToken(sessionId: string, refreshToken: string, res: Response) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.sessionService.updateSession(
      sessionId,
      {
        refresh_token: hashedRefreshToken,
      },
      res
    );
  }

  async signTokens(sessionId: string, user: Express.User) {
    const payload = { username: user.email, sub: { sid: sessionId, uid: user.id } };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_TTL"),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(req: Request, res: Response) {
    const user = req.user;
    const session = req.session;
    const sessionId = session?.sid;
    const sessionRefreshToken = session?.refresh_token;
    const userRefreshToken = user?.refreshToken;

    if (!(sessionId && sessionRefreshToken && userRefreshToken)) {
      throw new ForbiddenException("Seems like this request is bad or malformed");
    }

    // check that the session ID matches
    const refreshTokenMatches = await argon2.verify(sessionRefreshToken, userRefreshToken);
    if (!refreshTokenMatches) {
      throw new ForbiddenException("Your access is denied as there is a token mismatch");
    }

    const { accessToken, refreshToken } = await this.signTokens(sessionId, user);
    await this.updateRefreshToken(sessionId, refreshToken, res);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validatePassword(payload: CredentialDto) {
    try {
      const { email, password } = credentialSchema.parse(payload);
      const user = await this.usersService.getUser({ email });

      if (user && email === user.email && password.includes("password")) {
        return user;
      }

      throw new BadRequestException("Email or password are invalid");
    } catch (error) {
      throw new BadRequestException("Email and/or password are invalid");
    }
  }

  // Log user in — regenerate session and set user
  async login(req: Request, res: Response) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException("Email and password are required");
    }
    // Destroy old session and create new session (session regeneration)
    await this.sessionService.destroySession(req, res);

    // Create fresh session and set user in it
    const { sessionId } = await this.sessionService.createSession(res, user);
    const { accessToken, refreshToken } = await this.signTokens(sessionId, user);
    await this.updateRefreshToken(sessionId, refreshToken, res);

    return {
      ...user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(req: Request, res: Response) {
    await this.sessionService.destroySession(req, res);
  }
}
