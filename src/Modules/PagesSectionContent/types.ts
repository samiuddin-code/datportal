import { APIResponseObject } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";

export type PagesContent_TCreateInput = {
	language: string
	title: string
	highlight: string | null
	description: string | null
	isDefault: number
}

export type PagesSectionContentType = {
	id: number;
    pageSectionId: number;
    image?: string;
    imageAlt?: string;
    isDefault?: number;
    addedDate: Date;
    addedById?: number;
    countryId?: number;
    country: CountryTypes
    modifiedDate: Date;
    modifiedById?: number;
    isPublished?: boolean;
    isDeleted?: boolean;
    localization: PagesContent_TCreateInput[]
}


export type PagesSectionContentResponseObject = APIResponseObject & { data: PagesSectionContentType };
export type PagesSectionContentResponseArray = APIResponseObject & { data: Array<PagesSectionContentType> };
