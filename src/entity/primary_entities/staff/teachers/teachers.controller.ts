import {
    Controller,
    Post,
    Patch,
    Delete,
    Body,
    UseInterceptors,
    UseGuards,
    Get,
} from '@nestjs/common';
import { LogoutSchema, TeachersSchema, UpdateStaffSchema, SubjectUpdateSchema, LoginSchema, FetchSchema, PermissionsSchema, TokenVerifySchema, OtpVerifySchema } from 'src/validation/schemas/staff.schema';
import { CreateTeacherDto, DeleteStaffDto, LogoutDto, LoginDto, UpdateSubjectDto, UpdateStaffDto, FetchStaffDto, PermissionsDto, OtpVerify, TokenVerify } from 'src/validation/dtos/staff.dto';
import { StaffInterceptor } from 'src/validation/intercepts/staff.intercept';
import { DeleteStaffSchema } from 'src/validation/schemas/staff.schema';
import { EntityGuards } from 'src/validation/guards/entities.guards';
import { JoiPipe } from 'src/validation/validation.pipe';
import { TeachersServices } from './teachers.services';

@Controller('teachers')
@UseGuards(EntityGuards)
@UseInterceptors(StaffInterceptor)
export class TeachersControllers {
    constructor(private readonly teachersServices: TeachersServices) { }

    @Get("account")
    async returnTeacher(@Body(new JoiPipe(FetchSchema)) payload: FetchStaffDto) {
        return await this.teachersServices.fetchTeacherDoc(payload)
    }

    @Get("account/all")
    async returnAllTeachers(@Body(new JoiPipe(FetchSchema)) payload: FetchStaffDto) {
        return await this.teachersServices.fetchAllTeacherDocs(payload);
    }

    /* record creation routes */
    @Post('account/new')
    async createTeacher(@Body(new JoiPipe(TeachersSchema)) payload: CreateTeacherDto) {
        return await this.teachersServices.createAnAccount(payload);
    }

    @Post('account/login/token/')
    async tokenLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginDto) {
        return await this.teachersServices.loginViaEmail(payload);
    }

    @Post('account/login/otp/')
    async otpLogin(@Body(new JoiPipe(LoginSchema)) payload: LoginDto) {
        return await this.teachersServices.loginViaOTP(payload);
    }

    @Post('verify/token')
    async tokenVerifyAccount(@Body(new JoiPipe(TokenVerifySchema)) payload: TokenVerify) {
        return await this.teachersServices.verifyEmailLogin(payload);
    }

    @Post('verify/otp')
    async otpVerifyAccount(@Body(new JoiPipe(OtpVerifySchema)) payload: OtpVerify) {
        return await this.teachersServices.verifyOtpLogin(payload);
    }

    /* record updates routes */
    @Patch('permissions')
    async grantPermissions(@Body(new JoiPipe(PermissionsSchema)) data: PermissionsDto) {
        return await this.teachersServices.grantTeacherPermissions(data);
    }

    @Patch("account/update")
    async updateAccount(@Body(new JoiPipe(UpdateStaffSchema)) data: UpdateStaffDto) {
        return await this.teachersServices.runUpdateAccount(data);
    }

    @Patch("subjects/update")
    async updateSubjects(@Body(new JoiPipe(SubjectUpdateSchema)) data: UpdateSubjectDto) {
        return await this.teachersServices.runUpdateSubjects(data);
    }

    /* record deletion routes */
    @Delete("account/logout")
    async logoutAccount(@Body(new JoiPipe(LogoutSchema)) payload: LogoutDto) {
        return await this.teachersServices.runLogoutAccount(payload);
    }

    @Delete("account/purge")
    async deleteAccount(@Body(new JoiPipe(DeleteStaffSchema)) payload: DeleteStaffDto) {
        return this.teachersServices.runDeleteAccount(payload);
    }
}
