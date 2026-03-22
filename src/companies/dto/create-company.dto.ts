import {
    IsString,
    IsOptional,
    IsEnum,
    IsDateString,
    IsArray
} from "class-validator";
import { CompanyStatus } from "../../@types/enums";

export class CreateCompanyDto {

    @IsString()
    companyName: string;

    @IsString()
    sector: string;

    @IsOptional()
    @IsString()
    about?: string;


    // @IsOptional()
    // @IsString()
    // logo?: string;

    // @IsOptional()
    // @IsString()
    // coverImage?: string;

    @IsOptional()
    @IsDateString()
    creationDate?: Date;

    @IsOptional()
    @IsString()
    companySize?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsArray()
    socialLinks?: string[];

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    headquarters?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(CompanyStatus)
    status?: CompanyStatus;

    @IsDateString()
    partnershipDate: Date;
}