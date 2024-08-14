import { APIResponseObject, TypeFromEnumValues } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";
import { PropertiesType } from "../Properties/types";
import { LeadEnquiryFollowUp } from "@modules/Enquiry/types";
import { OrganizationType } from "@modules/Organization/types";
import { UserTypes } from "@modules/User/types";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { ProjectTypes } from "@modules/Project/types";
import { QuotationTypes } from "@modules/Quotation/types";
import { LeadsStatus } from "@helpers/commonEnums";

export type LeadsTypes = {
	id: number;
	uuid: string;
	message: string;
	clientId: number;
	enquiryId: number;
	individualClientId: number;
	projectTypeId: number;
	representativeId: number;
	submissionById: number | null;
	SubmissionBy: OrganizationType;
	status: number;
	addedDate: string;
	repliedDate: string;
	modifiedDate: string;
	isDeleted: boolean;
	addedById: number;
	modifiedById: number;
	assignedToId: number;
	assignedById: number;
	dueDateForSubmissions: string;
	LeadEnquiryFollowUp: LeadEnquiryFollowUp[];
	Quotation: (QuotationTypes & { AddedBy: UserTypes })[];
	AssignedTo: UserTypes;
	Client: OrganizationType
	ProjectType: ProjectTypeType
	Representative: UserTypes;
	Project: ProjectTypes;
	Attachments: AttachmentType[]
	_count: { LeadEnquiryFollowUp: number; }

}

export type LeadsNotesTypes = {
	id: number;
	note: string;
	addedDate: string;
	addedById: number;
	leadId: number;
}

export type AttachmentType = {
	id: number,
	title: string,
	file: string,
	mimeType: string,
	addedDate: string,
	enquiryId: number,
	leadId: number,
	isDeleted: boolean,
}

// query params types
export type LeadsParamTypes = {
	__status: TypeFromEnumValues<typeof LeadsStatus>[]
	fromDate: string;
	toDate: string;
	clientId: number;
	enquiryId: number;
	representativeId: number;
	projectTypeId: number;
	fetchCompleted: boolean;
	sortByField: string;
	sortOrder: string;
	hasConcerns: boolean;
	assignedToId: number;
}

export type LeadsTrackingTypes = {
	id: number;
	name: string;
	slug: string;
	email: string;
	phone: string;
	phoneCode: string;
	message: string;
	reference: string;
	source: string;
	propertyId: number;
	property: PropertiesType
	status: number;
	addedDate: string;
	addedById: number;
	countryId: number;
	organizationId: number;
	modifiedDate: string;
	modifiedById: number;
	country: CountryTypes
	leadNotes: LeadsNotesTypes[]
	assignedTo: UserTypes;
	assignedToId: number;
	assignedBy: UserTypes;
	assignedById: number;
	organization: OrganizationType
	userAgent: string;
	userIP: string;
}

export type PropertiesTrackingTypes = {
	perPage: number;
	page: number;
	fromDate: string;
	toDate: string;
	propertyId: number;
	userAgent: string;
	userIP: string;
	organizationId: number;
	propertyUrl: string;
	source: string;
	propertyCategory: any
	agentId: number;
}

export type LeadsStatusCounts = {
	all: number,
	active: number
	confirmed: number
	completed: number
	unqualified: number
	hasConcerns: number
}

export type LeadsResponseObject = APIResponseObject & { data: LeadsTypes | LeadsTrackingTypes };
export type LeadsResponseArray = APIResponseObject & { data: Array<LeadsTypes | LeadsTrackingTypes> };
