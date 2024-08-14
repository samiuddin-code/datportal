import { APIResponseObject } from "../Common/common.interface";

export type PropertyPriceType_Types = {
	id: number;
	slug: string;
	isDeleted: boolean;
	isPublished: boolean;
	order: number;
	min: number;
	max: number;
	localization: PriceTypeLocalization[];
}

export type PriceTypeLocalization = {
	id: number;
	title: string;
	label: string;
	description: string;
}

export type PropertyPriceType_TypesResponseObject = APIResponseObject & { data: PropertyPriceType_Types };
export type PropertyPriceType_TypesResponseArray = APIResponseObject & { data: Array<PropertyPriceType_Types> };
