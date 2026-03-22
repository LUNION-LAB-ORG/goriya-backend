import {
    IsString,
    IsArray,
    IsOptional,
    IsNumber,
    IsDateString,
    IsUUID
} from "class-validator";

export class CreatePortfolioDto {

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsArray()
    @IsString({ each: true })
    skills: string[];

    @IsOptional()
    @IsNumber()
    views?: number;

    @IsOptional()
    @IsNumber()
    downloads?: number;

    @IsOptional()
    @IsNumber()
    likes?: number;

    @IsDateString()
    createdDate: Date;

    @IsUUID()
    userId: string;
}