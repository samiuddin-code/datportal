import { APIResponseObject } from "../Common/common.interface";

export type PagesSectionType = {
	id: number,
	slug: string;
    title: string;
    description?: string;
    isPublished?: boolean;
    isDeleted?: boolean;
    pagesContent?: any;
    pageSectionRelation?:any
}

export type PagesSectionResponseObject = APIResponseObject & { data: PagesSectionType };
export type PagesSectionResponseArray = APIResponseObject & { data: Array<PagesSectionType> };
