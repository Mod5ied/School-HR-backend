import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import * as speakeasy from 'speakeasy';

describe('OtpService', () => {
    let otpService: OtpService;
    //   beforeEach(async () => {
    //     const module: TestingModule = await Test.createTestingModule({
    //       providers: [
    //         OtpService,
    //         {
    //           provide: 'speakeasyPkg',
    //           useValue: speakeasy,
    //         },
    //       ],
    //     }).compile();

    //     otpService = module.get<OtpService>(OtpService);
    //   });
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: OtpService,
                    useFactory: () => {
                        return new OtpService(speakeasy, speakeasy.generateSecret().base32);
                    },
                },
            ],
        }).compile();

        otpService = module.get<OtpService>(OtpService);
    });

    describe('generateOtp', () => {
        it('should generate a valid OTP and secret', () => {
            const { otp, secret } = otpService.generateOtp();

            expect(otp).toHaveLength(6);
            expect(secret).toBeDefined();
        });
    });

    describe('verifyOtp', () => {
        it('should verify a valid OTP', async () => {
            const { otp, secret } = otpService.generateOtp();

            // Wait for a short period of time to simulate the time taken between generating and verifying the OTP
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const isOtpValid = otpService.verifyOtp(otp, secret);

            expect(isOtpValid).toBe(true);
        });

        it('should not verify an invalid OTP', async () => {
            const invalidOtp = '123456';
            const { otp, secret } = otpService.generateOtp();

            // Wait for a short period of time to simulate the time taken between generating and verifying the OTP
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const isOtpValid = otpService.verifyOtp(invalidOtp, secret);

            expect(isOtpValid).toBe(false);
        });
    });
});
