import { APIResponseObject } from "../Common/common.interface";

export type PropertyTypeLocalization = {
	language: string;
	title: string;
};

export type PropertyType = {
	id: number;
	slug: string;
	icon: string | null;
	isDeleted: boolean;
	isPublished: boolean;
	localization: PropertyTypeLocalization[];
};

export type PropertyTypeResponseObject = APIResponseObject & { data: PropertyType };
export type PropertyTypeResponseArray = APIResponseObject & { data: Array<PropertyType> };
