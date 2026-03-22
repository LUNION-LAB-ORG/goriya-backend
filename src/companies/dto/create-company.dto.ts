import { IsString, IsOptional, IsEnum, IsDateString } from "class-validator";
import { CompanyStatus } from "src/@types/enums";

export class CreateCompanyDto {

    @IsString()
    name: string;

    @IsString()
    sector: string;

    // @IsOptional()
    // @IsString()
    // logo?: string;

    @IsOptional()
    @IsEnum(CompanyStatus)
    status?: CompanyStatus;

    @IsDateString()
    partnershipDate: Date;
}