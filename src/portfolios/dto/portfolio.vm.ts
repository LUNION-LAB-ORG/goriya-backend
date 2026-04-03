import { UserVm } from "../../users/dto/user.vm";

export class PortfolioVm {
    id!: string;
    title!: string;
    description!: string;
    skills!: string[];
    views!: number;
    downloads!: number;
    likes!: number;
    createdDate!: Date;
    user?: UserVm | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<PortfolioVm>) {
        Object.assign(this, partial);
    }
}
