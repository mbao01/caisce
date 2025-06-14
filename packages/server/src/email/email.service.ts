import { Inject, Injectable } from "@nestjs/common";
import { EMAIL_CLIENT } from "./email.constant";
import { EmailClient } from "./email.interface";

@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL_CLIENT) private client: EmailClient) {}

  async sendEmail({
    to,
    subject,
    html,
    from = "Your Name <you@yourdomain.com>",
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    await this.client.sendEmail({ from, to, subject, html });
  }
}
