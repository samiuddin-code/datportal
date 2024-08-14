import { APIResponseObject } from "../Common/common.interface";
import { BlogsTypes, BlogsLocalization } from "../Blogs/types";
import { CountryTypes } from "../Country/types";

export type BlogsCategoryType = {
	id: number;
	slug: string;
	localization: BlogsLocalization[];
	status: number;
	seoTitle: string;
	seoDescription: string;
	image: string;
	imageAlt: string;
	isPublished: boolean;
	isDeleted: boolean;
	countryId: number;
	addedDate: string;
	modifiedDate: string;
	deletedDate: string;
	addedById: number;
	modifiedById: number;
	deletedById: number;
	country: CountryTypes;
}

export type BlogsCategoryResponseObject = APIResponseObject & { data: BlogsTypes };
export type BlogsCategoryResponseArray = APIResponseObject & { data: Array<BlogsTypes> };
