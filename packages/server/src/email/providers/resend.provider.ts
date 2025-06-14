// email/providers/resend-mail.provider.ts
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { EmailClient } from "../email.interface";

export class ResendProvider implements EmailClient {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.get<string>("RESEND_API_KEY"));
  }

  async sendEmail({
    to,
    subject,
    html,
    from,
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    return this.resend.emails.send({
      from: from ?? "Default Sender <noreply@example.com>",
      to,
      subject,
      html,
    });
  }
}
