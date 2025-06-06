import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  UsePipes,
  Response,
} from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CredentialDto, credentialSchema } from "./schema/login.schema";
import { ValidatorPipe } from "src/pipes/validator.pipe";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("credential")
  @UseGuards(LocalAuthGuard)
  async login(
    @Body(new ValidatorPipe(credentialSchema)) credential: CredentialDto,
    @Request() req,
    @Response({ passthrough: true }) res
  ) {
    return await this.authService.login(req, res);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
