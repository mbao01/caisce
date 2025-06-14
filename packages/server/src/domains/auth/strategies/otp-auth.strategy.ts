import { UsersService } from "@/domains/users/users.service";
// otp.strategy.ts
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { ProviderType } from "@prisma/client";

@Injectable()
export class OtpAuthStrategy extends PassportStrategy(Strategy, "otp") {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { email, firstName, otp } = req.body;
    if (!email || !otp) {
      throw new UnauthorizedException("Missing credentials");
    }

    const isValidOtp = await this.authService.validateOTP(email, otp);

    if (!isValidOtp) {
      throw new UnauthorizedException("Invalid OTP");
    }

    let foundUser = await this.usersService.getUser({
      email,
      providers: {
        some: { type: ProviderType.CREDENTIAL },
      },
    });

    if (!foundUser) {
      foundUser = await this.usersService.getUser({ email });

      if (!foundUser) {
        foundUser = await this.usersService.createUser({ email, firstName });
      }

      foundUser = await this.usersService.updateUser({
        where: { email },
        data: {
          providers: {
            create: [
              {
                providerId: foundUser.id,
                type: ProviderType.CREDENTIAL,
                emailVerified: true,
              },
            ],
          },
        },
      });
    }

    if (!foundUser) {
      throw new UnauthorizedException("User not found");
    }

    const user = {
      id: foundUser.id,
      email,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      picture: foundUser.picture,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };

    return user;
  }
}
