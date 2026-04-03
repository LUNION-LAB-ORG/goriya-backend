import { CompanyStatus } from "../../@types/enums";

export class CompanyVm {
    id!: string;
    name!: string;
    sector!: string;
    logo!: string | null;
    coverImage!: string | null;
    about!: string | null;
    website!: string | null;
    creationDate!: Date | null;
    partnershipDate!: Date;
    companySize!: string | null;
    socialLinks!: string[];
    country!: string | null;
    headquarters!: string | null;
    location!: string | null;
    phone!: string | null;
    email!: string | null;
    status!: CompanyStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<CompanyVm>) {
        Object.assign(this, partial);
    }
}
