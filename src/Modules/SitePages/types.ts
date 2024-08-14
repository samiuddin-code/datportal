import { APIResponseObject } from "../Common/common.interface";

export type SitePagesType = {
    id: number,
    slug: string;
    title: string;
    description?: string;
    isPublished?: boolean;
    isDeleted?: boolean;
    pagesContent?: Array<any>;
    pageSectionRelation?: Array<any>;
}

export type SitePagesResponseObject = APIResponseObject & { data: SitePagesType };
export type SitePagesResponseArray = APIResponseObject & { data: Array<SitePagesType> };
