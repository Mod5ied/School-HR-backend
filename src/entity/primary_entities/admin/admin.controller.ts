import { AdminSchema, FetchSchema, LoginSchema, LogoutSchema, OtpVerifySchema, TokenVerifySchema, UpdateAdminSchema } from "src/validation/schemas/admin.schema";
import { CreateAdmin, FetchAdmin, LoginAdmin, LogoutAdmin, OtpVerify, TokenVerify, UpdateAdmin } from "src/validation/dtos/admin.dto";
import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { JoiPipe } from "src/validation/validation.pipe";
import { AdminServices } from "./admin.services";


@Controller("admin")
export class AdminController {
    constructor(private readonly adminServices: AdminServices) { }

    @Get("")
    async returnAdmin(@Body(new JoiPipe(FetchSchema)) payload: FetchAdmin) {
        return await this.adminServices.fetchAdminDoc(payload);
    }

    @Post("account/new")
    async createAdmin(@Body(new JoiPipe(AdminSchema)) payload: CreateAdmin) {
        return await this.adminServices.createAnAccount(payload);
    }

    @Post("account/login/token")
    async tokenLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginAdmin) {
        return await this.adminServices.loginViaEmail(payload);
    }
    
    @Post("account/login/otp")
    async otpLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginAdmin) {
        return await this.adminServices.loginViaOTP(payload);
    }

    @Post("verify/token")
    async tokenVerifyAccount(@Body(new JoiPipe(TokenVerifySchema)) payload: TokenVerify) {
        return await this.adminServices.verifyEmailLogin(payload);
    }

    @Post("verify/otp")
    async otpVerifyAccount(@Body(new JoiPipe(OtpVerifySchema)) payload: OtpVerify) {
        return await this.adminServices.verifyOtpLogin(payload);
    }

    @Patch("account/update")
    async updateAccount(@Body(new JoiPipe(UpdateAdminSchema)) payload: UpdateAdmin) {
        return await this.adminServices.runUpdateAccount(payload);
    }

    @Delete("account/logout")
    async logoutAccount(@Body(new JoiPipe(LogoutSchema)) payload: LogoutAdmin) {
        return await this.adminServices.runLogoutAccount(payload);
    }
}