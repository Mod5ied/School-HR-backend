// email-options interface
export interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export interface TransportConfig {
  service: string;
  user: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string; // naturally, replace both with your real credentials or an application-specific password
  };
}
