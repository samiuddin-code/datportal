import { APIResponseObject } from "../Common/common.interface";


export type FAQLocalization = {
	language: string;
	title: string;
	description: string;
}

export type FAQTypes = {
	id: number;
	slug: string;
	faqsCategoryId: number;
	isPublished: boolean;
	isDeleted: boolean;
	FaqsCategory: { slug: string };
	title: string;
	description: string;
	localization: FAQLocalization[]
};

// query params types
export type FAQ_API_QUERY_TYPES = {
	title: string;
	faqsCategoryId: number;
	faqsCategorySlug: string;
	perPage: number;
	page: number;
}


export interface FAQDetailsType {
    id:             number;
    slug:           string;
    faqsCategoryId: number;
    forAdminpanel:  boolean;
    isPublished:    boolean;
    isDeleted:      boolean;
    title:          string;
    description:    string;
    FaqsCategory:   FaqsCategory;
}

export interface FaqsCategory {
    slug:        string;
    title:       string;
    description: string;
}

export type FAQTypesResponseObject = APIResponseObject & { data: FAQTypes };
export type FAQTypesResponseArray = APIResponseObject & { data: Array<FAQTypes> };
