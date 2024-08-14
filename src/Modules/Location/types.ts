import { APIResponseObject } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";

export type LocationTypeLocalization = {
	language: string;
	name: string;
	pathName: string;
	locationId: number;
	isDefault: number;
};

export type LocationType = {
	id: number;
	parentId: number;
	slug: string;
	path: string;
	type: string;
	level: number;
	reviewScore: number;
	reviewsCount: number;
	image: string;
	latitude: number;
	longitude: number;
	abbreviation?: string;
	isDeleted: boolean;
	isPublished: boolean;
	addedDate: Date;
	url: string;
	countryId?: number;
	country: CountryTypes;
	referenceId: number;
	localization: LocationTypeLocalization[];
};

export type LocationTypeResponseObject = APIResponseObject & { data: LocationType };
export type LocationTypeResponseArray = APIResponseObject & { data: Array<LocationType> };
