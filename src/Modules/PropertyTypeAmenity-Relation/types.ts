import { APIResponseObject } from "../Common/common.interface";
import { Amenity } from "../Amenity/types";

export type PropertyTypeAmenityRelationType = {
	id: number;
	slug: string;
	icon: string;
	isDeleted: boolean;
	isPublished: boolean;
	localization: Localization[];
	propertyTypeAmenityRelation: PropertyTypeAmenityRelation[];
}

export type Localization = {
	title: string;
	description: string;
}

export type PropertyTypeAmenityRelation = {
	amenityId: number;
	amenity: Amenity;
}

export type PropertyTypeAmenityRelationResponseObject = APIResponseObject & {
	data: PropertyTypeAmenityRelationType;
};

export type PropertyTypeAmenityRelationResponseArray = APIResponseObject & {
	data: Array<PropertyTypeAmenityRelationType>;
};
