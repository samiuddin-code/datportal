// import { PropertyCategories } from "../../helpers/commonEnums";
import { APIResponseObject } from "../Common/common.interface";
import { OrganizationType } from "../Organization/types";
import { PropertiesType } from "../Properties/types";

export type WhatsappTypes = {
	id: number;
	from: string;
	to: string;
	type: string;
	message: string;
	status: number;
	addedDate: Date;
	organizationId: number;
	userId: number;
	propertyId: number;
	organization: OrganizationType
	property: PropertiesType
}

// query params types
export type WHATSAPP_QUERY_TYPES = {
	perPage: number;
	page: number;
	sortByField: string;
	sortOrder: string;
	phone: string;
	status: string;
	fromDate: string;
	toDate: string;
	propertyId: number;
	propertyCategory: any;
	organizationId: number;
	propertyUrl: string;
	agentId: number;
}

export type WhatsappResponseObject = APIResponseObject & { data: WhatsappTypes };
export type WhatsappResponseArray = APIResponseObject & { data: WhatsappTypes[] };
