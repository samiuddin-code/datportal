import { APIResponseObject } from "../Common/common.interface";

export type StaticPageSEOType = {
    id: number;
    seoTitle: string;
    seoDescription: string;
    image: string;
    isDefault: number;
    countryId: number;
    sitePageId: number;
    addedDate: Date;
    modifiedDate: null;
    modifiedById: null;
}

export type StaticPageSEOResponseObject = APIResponseObject & { data: StaticPageSEOType };
export type StaticPageSEOResponseArray = APIResponseObject & { data: Array<StaticPageSEOType> };

