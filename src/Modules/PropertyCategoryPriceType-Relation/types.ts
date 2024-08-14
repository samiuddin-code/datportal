import { APIResponseObject } from "../Common/common.interface";
import { PropertyPriceType_Types } from "../PropertyPriceType/types";
import { PropertyType } from "../PropertyType/types";

export type PropertyCatTypePriceRelationType = {
	id: number;
	slug: string;
	isDeleted: boolean;
	isPublished: boolean;
	propertyCategoryTypePriceRelation: PropertyCategoryTypePriceRelation[];
};

export interface PropertyCategoryTypePriceRelation {
	type: PropertyType;
	priceType: PropertyPriceType_Types;
}

export type PropertyCatTypePriceRelationResponseObject = APIResponseObject & {
	data: PropertyCatTypePriceRelationType;
};

export type PropertyCatTypePriceRelationResponseArray = APIResponseObject & {
	data: Array<PropertyCatTypePriceRelationType>;
};
