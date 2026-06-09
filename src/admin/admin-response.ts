export type ApiSuccessResponse<T> = {
    success: true;
    message?: string;
    data: T;
};

export type PaginatedMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type ApiPaginatedResponse<T> = {
    data: T[];
    meta: PaginatedMeta;
};

export function success<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return {
        success: true,
        ...(message ? { message } : {}),
        data,
    };
}

export function paginated<T>(payload: ApiPaginatedResponse<T>): ApiPaginatedResponse<T> {
    return payload;
}