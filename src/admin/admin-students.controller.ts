import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { UserRole, UserStatus } from '../@types/enums';
import { UsersService } from '../users/users.service';
import { AdminPlatformService } from './admin-platform.service';
import { paginated, success } from './admin-response';
import type { UploadedFile as MulterFile } from '../@types/utils';

@ApiTags('Admin Students')
@Controller('admin/students')
export class AdminStudentsController {
    constructor(
        private readonly usersService: UsersService,
        private readonly adminPlatformService: AdminPlatformService,
    ) {}

    @Get('paginate')
    async paginateStudents(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('search') search?: string,
        @Query('status') status?: UserStatus,
    ) {
        return paginated(await this.usersService.paginate(Number(page), Number(limit), {
            name: search,
            status,
            role: UserRole.USER,
        }));
    }

    @Get('stats')
    async getStats() {
        return success(await this.adminPlatformService.getStudentStats());
    }

    @Get('export')
    async exportStudents(@Res() res: Response) {
        const buffer = await this.adminPlatformService.exportUsersCsv();
        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="students.csv"',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    @Get(':id')
    async getStudent(@Param('id') id: string) {
        return success(await this.usersService.findOne(id));
    }

    @Post()
    @UseInterceptors(FileInterceptor('avatar'))
    async createStudent(@Body() body: Record<string, unknown>, @UploadedFile() avatar?: MulterFile) {
        const result = await this.usersService.create({ ...body, role: UserRole.USER } as never, avatar);
        return success(result.user);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateStudent(
        @Param('id') id: string,
        @Body() body: Record<string, unknown>,
        @UploadedFile() avatar?: MulterFile,
    ) {
        return success(await this.usersService.update(id, body as never, avatar));
    }

    @Patch(':id/status')
    async updateStudentStatus(@Param('id') id: string, @Body() body: { status: UserStatus }) {
        return success(await this.usersService.update(id, { status: body.status } as never));
    }

    @Delete(':id')
    async deleteStudent(@Param('id') id: string) {
        await this.usersService.remove(id);
        return success(null);
    }
}