interface EmailResponseSuccess {
  /** The ID of the newly created email. */
  id: string;
}

interface ErrorResponse {
  message: string;
  name: string;
}

interface EmailResponse {
  data: EmailResponseSuccess | null;
  error: ErrorResponse | null;
}

export interface EmailClient {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<EmailResponse>;
}
