export interface PaginatedResult<T> {
    data: T[],
    total: number,
    pagina: number,
    porPagina: number,
    lastPage: number
};
