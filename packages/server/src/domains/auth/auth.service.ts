import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CredentialDto, credentialSchema } from "./schema/login.schema";
import { SessionService } from "@/session/session.service";
import { Request, Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionService,
    private usersService: UsersService
  ) {}

  async validatePassword(payload: CredentialDto) {
    try {
      const { email, password } = credentialSchema.parse(payload);
      const user = await this.usersService.getUser({ email });

      if (user && user.email === password) {
        return user;
      }

      return null;
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
    const { sid } = await this.sessionService.createSession(res, user);
    const payload = { username: user.email, sub: { sid, uid: user.id } };
    const accessToken = this.jwtService.sign(payload);

    return {
      ...user,
      access_token: accessToken,
    };
  }

  async logout(req: Request, res: Response) {
    await this.sessionService.destroySession(req, res);
  }
}
