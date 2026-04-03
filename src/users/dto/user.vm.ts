import { UserRole, UserStatus } from "../../@types/enums";
import { CompanyVm } from "../../companies/dto/company.vm";

export class UserVm {
    id!: string;
    name!: string;
    email!: string;
    role!: UserRole;
    status!: UserStatus;
    avatar!: string | null;
    registrationDate!: Date;
    company?: CompanyVm | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<UserVm>) {
        Object.assign(this, partial);
    }
}
