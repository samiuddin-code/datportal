import { APIResponseObject } from "../Common/common.interface";
import { BlogsCategoryType } from "../BlogsCategory/types";
import { CountryTypes } from "../Country/types";

export type BlogsLocalization = {
	language: string
	title: string
	highlight: string | null
	description: string | null
	blogId: number
	isDefault: number
}

export type BlogsTypes = {
	id: number;
	category: number;
	slug: string;
	status: number;
	seoTitle: string;
	seoDescription: string;
	image: string;
	imageAlt: string;
	isDeleted: boolean;
	countryId: number;
	country: CountryTypes
	addedDate: Date;
	modifiedDate: Date;
	deletedDate: Date;
	addedById: number;
	modifiedById: number;
	deletedById: number;
	localization: BlogsLocalization[];
	blogsCategory: BlogsCategoryType;
}


export type BlogsResponseObject = APIResponseObject & { data: BlogsTypes };
export type BlogsResponseArray = APIResponseObject & { data: Array<BlogsTypes> };
