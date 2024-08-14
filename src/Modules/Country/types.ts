import { APIResponseObject } from "../Common/common.interface";

export type CountryTypes = {
	id: number;
	name: string;
	isoCode: string;
	shortName: string;
	displayName: string;
	phoneCode: string;
	flag: string;
	defaultCurrency: number;
	defaultLanguage: number;
	enabledLanguages: number[];
	defaultAreaUnit: number;
	status: number;
	isPublished: boolean;
	isDeleted: boolean;
	addedDate: string;
	addedBy: number;
	modifiedDate: string;
	modifiedBy: number;
	deletedDate: string;
	deletedBy: number;
};

export type CountryResponseObject = APIResponseObject & { data: CountryTypes };
export type CountryResponseArray = APIResponseObject & { data: Array<CountryTypes> };
