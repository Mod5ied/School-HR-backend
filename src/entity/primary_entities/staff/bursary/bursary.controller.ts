import { BursarsSchema, DeleteStaffSchema, FetchSchema, LoginSchema, LogoutSchema, OtpVerifySchema, PermissionsSchema, TokenVerifySchema, UpdateStaffSchema } from "src/validation/schemas/staff.schema";
import { CreateBursarDto, DeleteStaffDto, FetchStaffDto, LoginDto, LogoutDto, OtpVerify, PermissionsDto, TokenVerify, UpdateStaffDto } from "src/validation/dtos/staff.dto";
import { Body, Controller, Delete, Get, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { StaffInterceptor } from "src/validation/intercepts/staff.intercept";
import { EntityGuards } from "src/validation/guards/entities.guards";
import { JoiPipe } from "src/validation/validation.pipe";
import { BursaryServices } from "./bursary.services";

@Controller("bursars")
@UseGuards(EntityGuards)
@UseInterceptors(StaffInterceptor)
export class BursaryController {
    constructor(private readonly bursaryServices: BursaryServices) { }

    @Get("account")
    async returnBursar(@Body(new JoiPipe(FetchSchema)) payload: FetchStaffDto) {
        return await this.bursaryServices.fetchBursarDoc(payload);
    }

    @Get("account/all")
    async returnAllBursars(@Body(new JoiPipe(FetchSchema)) payload: FetchStaffDto) {
        return await this.bursaryServices.fetchAllBursaryDocs(payload);
    }

    /* auth routes: */
    @Post("account/new")
    async createBursar(@Body(new JoiPipe(BursarsSchema)) payload: CreateBursarDto) {
        return await this.bursaryServices.createAnAccount(payload);
    }

    @Post("account/login/token")
    async tokenLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginDto) {
        return await this.bursaryServices.loginViaEmail(payload);
    }

    @Post("account/login/otp")
    async otpLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginDto) {
        return await this.bursaryServices.loginViaOTP(payload);
    }

    @Post("verify/token")
    async tokenVerifyAccount(@Body(new JoiPipe(TokenVerifySchema)) payload: TokenVerify) {
        return await this.bursaryServices.verifyEmailLogin(payload);
    }
    @Post("verify/otp")
    async otpVerifyAccount(@Body(new JoiPipe(OtpVerifySchema)) payload: OtpVerify) {
        return await this.bursaryServices.verifyOtpLogin(payload);
    }

    @Patch("account/update")
    async updateAccount(@Body(new JoiPipe(UpdateStaffSchema)) payload: UpdateStaffDto) {
        return await this.bursaryServices.runUpdateAccount(payload);
    }

    @Patch("permissions")
    async grantPermissions(@Body(new JoiPipe(PermissionsSchema)) data: PermissionsDto) {
        return await this.bursaryServices.grantBursaryPermissions(data);
    }

    @Delete("account/logout")
    async logoutAccount(@Body(new JoiPipe(LogoutSchema)) payload: LogoutDto) {
        return await this.bursaryServices.runLogoutAccount(payload);
    }

    @Delete("account/purge")
    async deleteAccount(@Body(new JoiPipe(DeleteStaffSchema)) payload: DeleteStaffDto) {
        return await this.bursaryServices.runDeleteAccount(payload);
    }
}