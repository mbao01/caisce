import { UsersService } from "@/domains/users/users.service";
import { SessionService } from "@/session/session.service";
import { ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ProviderType } from "@prisma/client";
import { Strategy, Profile } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID") as string,
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET") as string,
      callbackURL: configService.get("GOOGLE_CALLBACK_URL") as string,
      scope: ["profile", "email"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Partial<Profile>
  ): Promise<any> {
    const { id: providerId, name, emails, photos, _json: tokenPayload } = profile;
    const email = emails?.[0].value;

    if (!providerId || !email) {
      throw new ForbiddenException(
        "This is a protected resource and you must access it accordingly"
      );
    }

    let foundUser = await this.usersService.getUser({
      email,
      providers: {
        some: { providerId },
      },
    });
    if (!foundUser) {
      foundUser = await this.usersService.getUser({ email });

      const provider = {
        providerId,
        type: ProviderType.GOOGLE,
        emailVerified: Boolean(tokenPayload?.email_verified),
      };

      if (foundUser) {
        foundUser = await this.usersService.updateUser({
          where: { email },
          data: {
            providers: {
              create: [provider],
            },
          },
        });
      } else {
        foundUser = await this.usersService.createUser({
          email,
          firstName: name?.givenName,
          lastName: name?.familyName,
          picture: photos?.[0].value,
          providers: {
            create: [provider],
          },
        });
      }
    }

    if (!foundUser) {
      throw new InternalServerErrorException("Could not find nor create user");
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
