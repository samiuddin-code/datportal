import { APIResponseObject } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";

export type PagesLocalization = {
	language: string
	title: string
	highlight: string | null
	description: string | null
	pageId: number
	isDefault: number
}

export type PagesTypes = {
	id: number;
	slug: string;
	status: number;
	seoTitle: string;
	seoDescription: string;
	image: string;
	imageAlt: string;
	isDeleted: boolean;
	countryId: number;
	addedDate: Date;
	modifiedDate: Date;
	addedById: number;
	modifiedById: number;
	country: CountryTypes
	localization: PagesLocalization[];
	deletedDate: Date;
	deletedById: number;
}


export type PagesResponseObject = APIResponseObject & { data: PagesTypes };
export type PagesResponseArray = APIResponseObject & { data: Array<PagesTypes> };
