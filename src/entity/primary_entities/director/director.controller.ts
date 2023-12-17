import { DeleteDirectorSchema, DirectorSchema, FetchSchema, LoginSchema, LogoutSchema, OtpVerifySchema, TokenVerifySchema, UpdateDirectorSchema } from "src/validation/schemas/director.schema";
import { CreateDirector, DeleteDirector, FetchDirector, LoginDirector, LogoutDirector, OtpVerify, TokenVerify, UpdateDirector } from "src/validation/dtos/director.dto";
import { Body, Controller, Delete, Get, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { DirectorsInterceptor } from "src/validation/intercepts/director.intercept";
import { EntityGuards } from "src/validation/guards/entities.guards";
import { JoiPipe } from "src/validation/validation.pipe";
import { DirectorServices } from "./director.services";

@Controller("directors")
@UseGuards(EntityGuards)
@UseInterceptors(DirectorsInterceptor)
export class DirectorController {
    constructor(private readonly directorServices: DirectorServices) { }

    @Get("account")
    async returnDirector(@Body(new JoiPipe(FetchSchema)) payload: FetchDirector) {
        return await this.directorServices.fetchDirectorDoc(payload);
    }

    @Get("account/all")
    async returnAllDirectors() {
        return await this.directorServices.fetchAllDirectors()
    }

    @Post("account/new")
    async createDirector(@Body(new JoiPipe(DirectorSchema)) payload: CreateDirector) {
        return await this.directorServices.createAnAccount(payload);
    }

    @Post("account/login/token")
    async tokenLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginDirector) {
        return await this.directorServices.loginViaEmail(payload);
    }

    @Post("account/login/otp")
    async otpLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginDirector) {
        return await this.directorServices.loginViaOTP(payload);
    }

    @Post("verify/token")
    async tokenVerifyAccount(@Body(new JoiPipe(TokenVerifySchema)) payload: TokenVerify) {
        return await this.directorServices.verifyEmailLogin(payload);
    }

    @Post("verify/otp")
    async otpVerifyAccount(@Body(new JoiPipe(OtpVerifySchema)) payload: OtpVerify) {
        return await this.directorServices.verifyOtpLogin(payload);
    }

    @Patch("account/update")
    async updateAccount(@Body(new JoiPipe(UpdateDirectorSchema)) payload: UpdateDirector) {
        return await this.directorServices.runUpdateAccount(payload);
    }

    @Delete("account/logout")
    async logoutAccount(@Body(new JoiPipe(LogoutSchema)) payload: LogoutDirector) {
        return await this.directorServices.runLogoutAccount(payload);
    }

    @Delete("account/purge")
    async deleteAccount(@Body(new JoiPipe(DeleteDirectorSchema)) payload: DeleteDirector) {
        return await this.directorServices.runDeleteAccount(payload);
    }
}