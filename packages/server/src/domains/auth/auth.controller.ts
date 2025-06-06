import { type Request } from "express";
import { Controller, Post, UseGuards, Get, Body, Req, Res } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAccessGuard } from "./guards/jwt-access.guard";
import { CredentialDto, credentialSchema } from "./schema/login.schema";
import { ValidatorPipe } from "src/pipes/validator.pipe";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";

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

  @UseGuards(JwtRefreshGuard)
  @Get("refresh")
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res) {
    return await this.authService.refreshTokens(req, res);
  }

  @Get("profile")
  @UseGuards(JwtAccessGuard)
  getProfile(@Req() req) {
    return req.user;
  }
}
