import { CacheService } from "@/cache/cache.service";
import { Injectable } from "@nestjs/common";
import { OTP_KEY_PREFIX, TEN_MINUTE } from "./otp.constant";
import { EmailService } from "@/email/email.service";

@Injectable()
export class OtpService {
  constructor(
    private cacheService: CacheService,
    private emailService: EmailService
  ) {}

  #getCacheKey(email: string) {
    return `${OTP_KEY_PREFIX}${email}`;
  }

  async sendEmail(email: string, otp: string, otpExpiry: Date) {
    this.emailService.sendEmail({
      to: email,
      from: "hi@ayomidebakare.site",
      subject: "OTP for login",
      html: `<p>OTP: ${otp} <br /> This OTP will expire in ${otpExpiry}</p>`,
    });
    console.log(`OTP for ${email}: ${otp}`);
  }

  async getOtp(email: string) {
    const cacheKey = this.#getCacheKey(email);
    return await this.cacheService.get<string>(cacheKey);
  }

  async saveOtp(email: string, otp: string) {
    const cacheKey = this.#getCacheKey(email);
    const otpExpiry = new Date(Date.now() + TEN_MINUTE);

    await this.cacheService.set(cacheKey, otp, TEN_MINUTE);

    return { otpExpiry };
  }

  async deleteOtp(email: string) {
    const cacheKey = this.#getCacheKey(email);
    await this.cacheService.del(cacheKey);
  }
}
