import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EMAIL_CLIENT } from "./email.constant";
import { ResendProvider } from "./providers/resend.provider";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_CLIENT,
      useFactory: async (configService: ConfigService) => {
        return new ResendProvider(configService);
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
