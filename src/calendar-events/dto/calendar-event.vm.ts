import { EventStatus, EventType } from "../../@types/enums";

export class CalendarEventVm {
    id!: string;
    title!: string;
    type!: EventType;
    startTime!: Date;
    endTime!: Date;
    participants!: string[];
    location!: string | null;
    status!: EventStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<CalendarEventVm>) {
        Object.assign(this, partial);
    }
}
