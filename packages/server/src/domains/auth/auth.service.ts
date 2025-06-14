import * as argon2 from "argon2";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CredentialDto, credentialSchema } from "./schema/login.schema";
import { SessionService } from "@/session/session.service";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ProviderType, User } from "@prisma/client";
import { OtpService } from "../otp/otp.service";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private otpService: OtpService,
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
    const payload = { username: user.email, sub: user.id, sid: sessionId };
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
    let user: User | null;

    try {
      const { email } = credentialSchema.parse(payload);
      user = await this.usersService.getUser({
        email,
        providers: {
          some: {
            type: ProviderType.CREDENTIAL,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException("Something went wrong trying to find user");
    }

    if (!user) {
      throw new BadRequestException("User may or may not exist");
    }

    return user;
  }

  // Log user in — regenerate session and set user
  async login(req: Request, res: Response) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException("Email is required");
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

  async googleComplete(payload: { state?: string; accessToken: string }, res: Response) {
    try {
      const state = payload.state
        ? JSON.parse(Buffer.from(payload.state, "base64").toString())
        : {};

      if (!state.redirectUrl) {
        throw new BadRequestException("Missing redirect URL");
      }

      const url = new URL(state.redirectUrl);
      url.searchParams.set("access_token", payload.accessToken);

      return res.redirect(url.toString());
    } catch (error) {
      throw new BadRequestException("Invalid state");
    }
  }

  async sendOTP(email: string) {
    const user = await this.usersService.getUser({ email });
    const isNewUser = !Boolean(user);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // save otp in redis!!!
    const { otpExpiry } = await this.otpService.saveOtp(email, otp);
    // TODO:: maybe email service???
    await this.otpService.sendEmail(email, otp, otpExpiry);

    return { isNewUser, otpExpiry };
  }

  async validateOTP(email: string, otp: string): Promise<any> {
    const validOtp = await this.otpService.getOtp(email);

    const isValidOtp = Boolean(validOtp && validOtp === otp);

    if (isValidOtp) {
      await this.otpService.deleteOtp(email);
    }

    return isValidOtp;
  }

  async signup(req: Request, res: Response) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException("Email is required");
    }

    const createdUser = await this.usersService.createUser(user);
    const { sessionId } = await this.sessionService.createSession(res, user);
    const { accessToken, refreshToken } = await this.signTokens(sessionId, user);
    await this.updateRefreshToken(sessionId, refreshToken, res);

    return {
      ...createdUser,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
