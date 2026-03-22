import { PartialType } from "@nestjs/mapped-types";
import { CreateInterviewSessionDto } from "./create-interview-session.dto";

export class UpdateInterviewSessionDto extends PartialType(CreateInterviewSessionDto) {}