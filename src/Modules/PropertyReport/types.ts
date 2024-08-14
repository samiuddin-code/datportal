import { APIResponseObject } from "../Common/common.interface";
import { PropertiesType } from "../Properties/types";
import { UserTypes } from "../User/types";

export type PropertyReportTypes = {
	id: number;
	userId: number;
	propertyId: number;
	reason: string;
	userType: string;
	comments: string;
	requestModificationAs: any;
	requestModificationReason: string;
	modificationRequestResponse: string;
	modificationRequestStatus: number;
	requestedForModification: boolean;
	canRequestForMofication: boolean;
	modificationRequestDate: string;
	modificationRequestResponseDate: string;
	modificationRequestedById: number;
	userAgent: string;
	userIP: string;
	addedDate: Date;
	modifiedDate: string;
	modifiedById: number;
	status: number;
	property: PropertiesType;
	user: UserTypes;
	modifiedBy: UserTypes;
	modificationRequestedBy: UserTypes;
};

export type PropertyReportFiltersTypes = {
	fromDate: string;
	toDate: string;
	userIP: string;
	userAgent: string;
	propertyUrl: string;
	organizationId: number;
	propertyCategory: string;
	propertyId: number;
	reason: string;
	status: string;
};

export type PropertyReportTypeResponseObject = APIResponseObject & {
	data: PropertyReportTypes;
};
export type PropertyReportTypeResponseArray = APIResponseObject & {
	data: Array<PropertyReportTypes>;
};
