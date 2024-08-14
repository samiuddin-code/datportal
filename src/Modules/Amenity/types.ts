import { APIResponseObject } from "../Common/common.interface";

export type AmenityLocalization = {
	language?: string;
	title: string;
};

export type Amenity = {
	id: number;
	slug: string;
	icon: string | null;
	isDeleted: boolean;
	isPublished: boolean;
	localization: AmenityLocalization[];
};

export type AmenityResponseObject = APIResponseObject & { data: Amenity };
export type AmenityResponseArray = APIResponseObject & { data: Array<Amenity> };
