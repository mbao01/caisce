import { SessionService } from "@/session/session.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    private sessionService: SessionService
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
    const { id, name, emails, photos, provider } = profile;
    const email = emails?.[0].value;
    const picture = photos?.[0].value;
    const fullName = name ? `${name?.givenName} ${name?.familyName}` : "";

    if (!id) {
      throw new ForbiddenException(
        "This is a protected resource and you must access it accordingly"
      );
    }

    if (id !== profile?._json?.sub) {
      throw new ForbiddenException("You are not authenticated to access this resource");
    }

    // TODO:: update user to match what should be sent to redis
    const user = {
      id,
      email,
    };

    return user;
  }
}
