import {
    IsString,
    IsEnum,
    IsArray,
    IsOptional,
    IsDateString
} from "class-validator";

import { EventStatus, EventType } from "src/@types/enums";

export class CreateCalendarEventDto {

    @IsString()
    title: string;

    @IsEnum(EventType)
    type: EventType;

    @IsDateString()
    startTime: Date;

    @IsDateString()
    endTime: Date;

    @IsArray()
    @IsString({ each: true })
    participants: string[];

    @IsOptional()
    @IsString()
    location?: string;

    @IsEnum(EventStatus)
    status: EventStatus;
}