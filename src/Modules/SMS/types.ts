import { APIResponseObject } from "../Common/common.interface";

export type SMSTypes = {
	id: number;
	slug: string;
	title: string;
	gateway: string;
	appId: string;
	appPassword: string;
	senderId: string;
	senderIdType: string;
	test: boolean;
	priority: number;
	isDefault: boolean;
	isPublished: boolean;
	isDeleted: boolean;
	countryId: number;
	addedDate: Date;
	addedById: number;
};

export type SMSLogsTypes = {
	id: number;
	uuid: string;
	gateway: string;
	number: string;
	message: string;
	status: string;
	remarks: null;
	error: null;
	transactionId: null;
	referenceId: null;
	sentDate: Date;
	userId: null;
}

export type SMSLogsFiltersTypes = {
	fromDate: string;
	toDate: string;
	message: string;
	userId: number;
	gateway: string;
	number: string;
	status: string;
}


export type SMSResponseObject = APIResponseObject & { data: SMSTypes };
export type SMSResponseArray = APIResponseObject & { data: Array<SMSTypes> };

export type SMSLogsResponseObject = APIResponseObject & { data: SMSLogsTypes };
export type SMSLogsResponseArray = APIResponseObject & { data: Array<SMSLogsTypes> };