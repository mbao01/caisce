import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleOauthGuard extends AuthGuard("google") {
  getAuthenticateOptions(context: ExecutionContext) {
    const { query } = context.switchToHttp().getRequest();

    return {
      state: {
        ...query,
      },
    };
  }
}
