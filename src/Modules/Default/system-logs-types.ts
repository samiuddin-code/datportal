import { APIResponseObject } from "../Common/common.interface";

export type SystemLogsTypes = {
    id: number;
    table: string;
    tableColumnKey: string;
    tableColumnValue: string;
    valueType: string;
    actionType: string;
    message: string;
    endPoint: string;
    controllerName: string;
    data: Data;
    countryId: number;
    organizationId: number;
    addedDate: Date;
    addedById: number;
}

export type Data = {
    slug: string;
    files: string[];
    addedBy: number;
    agencyId: number;
    location: Location;
    amenities: number[];
    countryId: number;
    reference: string;
    priceTypes: PriceType[];
    permitNumber: number;
    translations: Translation[];
    propertyTypeId: number;
    reraPermitNumber: number;
    propertyCategoryId: number;
}

export type Location = {
    stateId: number;
    buildingId: number;
    communityId: number;
    subCommunityId: number;
}

export type PriceType = {
    price: number;
    priceTypeSlug: string;
}

export type Translation = {
    title: string;
    language: string;
    isDefault: number;
    description: string;
}

export type SystemLogsFiltersTypes = {
    fromDate: string;
    toDate: string;
    table: string;
    tableColumnKey: string;
    tableColumnValue: string;
    organizationId: number;
    addedById: number;
}

export type SystemLogsResponseObject = APIResponseObject & { data: SystemLogsTypes };
export type SystemLogsResponseArray = APIResponseObject & { data: Array<SystemLogsTypes> };