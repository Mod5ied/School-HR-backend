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
import { LogoutSchema, TeachersSchema, UpdateTeacherSchema, SubjectUpdateSchema, LoginSchema, FetchSchema, PermissionsSchema, TokenVerifySchema, OtpVerifySchema } from 'src/validation/schemas/teachers.schema';
import { CreateTeacherDto, DeleteTeacherDto, LogoutDto, LoginDto, UpdateSubjectDto, UpdateTeacherDto, FetchTeachersDto, PermissionsDto, OtpVerify } from 'src/validation/dtos/teachers.dto';
import { DeleteTeachersSchema } from 'src/validation/schemas/teachers.schema';
import { VerifyUser } from 'src/services/tokens/tokens.types';
import { TeachersInterceptor } from './teachers.intercept';
import { JoiPipe } from 'src/validation/validation.pipe';
import { TeachersServices } from './teachers.services';
import { TeachersGuard } from './teachers.guard';

@Controller('teachers')
@UseGuards(TeachersGuard)
@UseInterceptors(TeachersInterceptor)
export class TeachersControllers {
    constructor(private readonly teachersServices: TeachersServices) { }

    @Get("")
    async returnTeacher(@Body(new JoiPipe(FetchSchema)) payload: FetchTeachersDto) {
        return await this.teachersServices.fetchTeacherAccount(payload)
    }

    @Get("all")
    async returnAllTeachers(@Body(new JoiPipe(FetchSchema)) payload: FetchTeachersDto) {
        return await this.teachersServices.fetchAllTeachers(payload);
    }

    /* record creation routes */
    @Post('account/new')
    async createTeacher(@Body(new JoiPipe(TeachersSchema)) teacher: CreateTeacherDto) {
        return await this.teachersServices.createAnAccount(teacher);
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
    async tokenVerifyAccount(@Body(new JoiPipe(TokenVerifySchema)) payload: VerifyUser) {
        return await this.teachersServices.verifyEmailLogin(payload);
    }

    @Post('verify/otp')
    async otpVerifyAccount(@Body(new JoiPipe(OtpVerifySchema)) payload: OtpVerify) {
        const { otp, phoneNumber } = payload;
        return await this.teachersServices.verifyOtpLogin(otp, phoneNumber);
    }

    /* record updates routes */
    @Patch('permissions')
    async grantPermissions(@Body(new JoiPipe(PermissionsSchema)) data: PermissionsDto) {
        return await this.teachersServices.grantTeacherPermissions(data);
    }

    @Patch("account/update")
    async updateAccount(@Body(new JoiPipe(UpdateTeacherSchema)) data: UpdateTeacherDto) {
        return await this.teachersServices.runUpdateAccount(data);
    }

    @Patch("subjects/update")
    async updateSubjects(@Body(new JoiPipe(SubjectUpdateSchema)) data: UpdateSubjectDto) {
        return await this.teachersServices.runUpdateSubjects(data);
    }

    /* record deletion routes */
    @Delete("account/logout")
    async logoutAccount(@Body(new JoiPipe(LogoutSchema)) payload: LogoutDto) {
        // async logoutAccount(@Body() payload: any) {
        return await this.teachersServices.runLogoutAccount(payload);
    }

    @Delete("account/purge")
    async deleteAccount(@Body(new JoiPipe(DeleteTeachersSchema)) payload: DeleteTeacherDto) {
        // async deleteAccount(@Body() payload: any) {
        return this.teachersServices.runDeleteAccount(payload);
    }
}
