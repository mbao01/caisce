import { SessionService } from "@/session/session.service";
import { Injectable } from "@nestjs/common";
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

  authorizationParams(
    options: { state?: Partial<{ redirectUrl: string }> } & Record<string, unknown>
  ): object {
    const state = options.state
      ? Buffer.from(JSON.stringify(options.state)).toString("base64")
      : undefined;
    return { ...options, state };
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<any> {
    const { id, name, emails, photos } = profile;

    // TODO:: update user to match what should be sent to redis
    const user = {
      provider: "google",
      providerId: id,
      email: emails?.[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      name: name ? `${name?.givenName} ${name?.familyName}` : "",
      picture: photos?.[0].value,
    };

    return user;
  }
}
