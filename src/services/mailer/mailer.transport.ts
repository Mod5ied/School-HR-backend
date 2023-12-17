import { EmailOptions, TransportConfig } from './mailer.types';
import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class EmailTransport {
  constructor(
    private readonly transportConfig: TransportConfig,
    private readonly logger: Logger,
  ) {}

  public async sendEmail(emailOptions: EmailOptions) {
    const transporter = createTransport(this.transportConfig);
    try {
      const transport = await transporter.sendMail(emailOptions);
      if (transport.pending) return this.logger.log('Sending email..');
      if (transport.accepted) return this.logger.log('Email sent!');
      if (transport.rejected) return this.logger.error('Failed to send!');
    } catch (e) {
      this.logger.error(`[Mail_Error] - ${e}`);
    }
  }
}

// export class EmailTransport extends TransportStream {
//   private mailerService: MailerService;
//   private emailOptions: EmailOptions;
//   constructor(
//     options: TransportStreamOptions,
//     mailerService: MailerService,
//     emailOption: EmailOptions,
//   ) {
//     super(options);
//     this.mailerService = mailerService;
//     this.emailOptions = emailOption;
//   }

//   public log(info: any, callback: () => void) {
//     setImmediate(() => this.emit('logged', info));

//     this.mailerService
//       .sendMail(this.emailOptions)
//       .then(() => console.log('Email send success'))
//       .catch(() => console.log('Failed to send mail'));

//     callback();
//   }
// }
