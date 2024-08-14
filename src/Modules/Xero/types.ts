export type XeroGetQuotesType = {
    ifModifiedSince: string,
    dateFrom: string,
    dateTo: string,
    expiryDateFrom: string,
    expiryDateTo: string,
    contactID: string,
    status: string,
    page: number,
    order: string,
    quoteNumber: string,
    tenantId: string
};
