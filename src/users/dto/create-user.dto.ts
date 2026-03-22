import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { UserRole, UserStatus } from '../../@types/enums';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    // @IsOptional()
    // @IsString()
    // avatar?: string;

    @IsOptional()
    @IsUUID()
    companyId?: string;
}