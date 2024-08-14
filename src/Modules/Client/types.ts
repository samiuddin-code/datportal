import { APIResponseObject } from "@modules/Common/common.interface";

export interface ClientType {
	id: number;
	uuid: string;
	name: string;
	type: 1 | 2;
	designation: string;
	phone: string;
	phoneCode: string;
	whatsapp: string;
	email: string;
	address: string;
	companyId: number;
	isDeleted: boolean;
	addedDate: string;
	modifiedDate: string;
	deletedDate: string;
	addedById: number;
	modifiedById: number;
	deletedById: number;
	logo: string;
}

export interface ClientParams {
	ids: number[]
	name: string
	email: string
	phone: string
	perPage: number
	page: string
	type: 1 | 2
}

export type ClientResponseObject = APIResponseObject & { data: ClientType };
export type ClientResponseArray = APIResponseObject & {
	data: Array<ClientType>;
};
