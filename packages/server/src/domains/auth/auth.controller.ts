import { type Request } from "express";
import { Controller, Post, UseGuards, Get, Body, Req, Res, Query } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAccessGuard } from "./guards/jwt-access.guard";
import { SignupDto, signupSchema } from "./schema/signup.schema";
import { CredentialDto, credentialSchema, OtpDto, otpSchema } from "./schema/login.schema";
import { ValidatorPipe } from "@/pipes/validator.pipe";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { GoogleOauthGuard } from "./guards/google-oauth.guard";
import { OtpAuthGuard } from "./guards/otp-auth.guard";
import { ApiBody } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(
    @Body(new ValidatorPipe(credentialSchema)) credential: CredentialDto,
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return await this.authService.login(req, res);
  }

  @Post("signup")
  @ApiBody({ type: SignupDto })
  async signup(
    @Body(new ValidatorPipe(signupSchema)) credential: SignupDto,
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return await this.authService.signup(req, res);
  }

  @UseGuards(JwtRefreshGuard)
  @Get("refresh")
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res) {
    return await this.authService.refreshTokens(req, res);
  }

  @Get("google")
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  /* istanbul ignore next */
  async google() {}

  @Get("google/callback")
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() req, @Res({ passthrough: true }) res, @Query("state") state) {
    const { access_token } = await this.authService.login(req, res);

    return await this.authService.googleComplete({ state, accessToken: access_token }, res);
  }

  @Post("otp")
  async otp(@Body(new ValidatorPipe(credentialSchema)) credential: CredentialDto) {
    return await this.authService.sendOTP(credential.email);
  }

  @Post("otp/callback")
  @UseGuards(OtpAuthGuard)
  async otpCallback(
    @Body(new ValidatorPipe(otpSchema)) otp: OtpDto,
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return await this.authService.login(req, res);
  }

  @Get("profile")
  @UseGuards(JwtAccessGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Get("logout")
  @UseGuards(JwtAccessGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    return await this.authService.logout(req, res);
  }
}
