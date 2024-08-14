import { WorkingHourType } from "@modules/WorkingHours/types";
import { APIResponseObject } from "../Common/common.interface";

export interface OrganizationType {
	id: number;
	uuid: string;
	organizationCode: string,
	parentId: null;
	name: string;
	description: null;
	email: string;
	phone: string;
	phoneCode: string;
	whatsapp: null;
	address: string;
	locationMap: string;
	logo: string;
	countryId: number | null;
	city: null;
	type: number;
	status: number;
	addedDate: Date;
	modifiedDate: null;
	deletedDate: null;
	isDeleted: boolean;
	isPublished: boolean;
	addedById: null;
	modifiedById: null;
	deletedById: null;
	Country: Country | null;
	WorkingHours?: WorkingHourType
}

export interface Country {
	name: string;
	isoCode: string;
	displayName: string;
}

export interface OrganizationParams {
	name: string
	perPage: number
	page: string
	sortByField: string
	sortOrder: string
	email: string
	ids: string[]
	phone: number
	status: number
	fromDate: Date
	toDate: Date
	isPublished: boolean
	location: string
	includeBranches: boolean
	fetchParentOnly: boolean
}

export type OrganizationResponseObject = APIResponseObject & { data: OrganizationType };
export type OrganizationResponseArray = APIResponseObject & { data: Array<OrganizationType> };