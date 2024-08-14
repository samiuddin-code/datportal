import { APIResponseObject } from "../Common/common.interface";
import { UserTypes } from "../User/types";

export type UserRatingTypes = {
	id: number;
	rating: number;
	message: string;
	name: string;
	email: string;
	status: number;
	phone: string;
	phoneCode: string;
	userId: number;
	ratedByUserId: number;
	addedDate: Date;
	helpType: number;
	propertyLink: string;
	propertyId: number;
	referenceNumber: string;
	interactedOn: string;
	user: UserTypes
}

// query params types
export type UserRating_QUERY_TYPES = {
	perPage: number;
	page: number;
	fromDate: string;
	toDate: string;
	sortByField: string;
	sortOrder: string;
	status: string;
	propertyId: number;
	organizationId: number;
	agentId: number;
	propertyLink: string;
}

export type UserRatingResponseObject = APIResponseObject & { data: UserRatingTypes };
export type UserRatingResponseArray = APIResponseObject & { data: Array<UserRatingTypes> };
