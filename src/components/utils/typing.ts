export interface FetchResult {
    [prop: string]: any;
}

export interface FetchPageResult {
    data: any[],
    pageNumber: number,
    pageSize: number,
    total: number
}
