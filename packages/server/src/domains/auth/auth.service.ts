import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CredentialDto, credentialSchema } from "./schema/login.schema";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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

  async login(user): Promise<any> {
    const payload = { username: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      ...user,
      access_token: accessToken,
    };
  }
}
