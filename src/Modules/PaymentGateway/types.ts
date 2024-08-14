import { APIResponseObject } from "../Common/common.interface";

export type PaymentGatewayTypes = {
	id: number;
	title: string;
	slug: string;
	gatewayURL: string;
	gatewayPublicKey: string;
	gatewayPrivateKey: string;
	storeId: string;
	test: boolean;
	isPublished: boolean;
	isDeleted: boolean;
	countryId: number;
	isDefault: boolean;
	addedDate: Date;
	addedById: number;
	modifiedDate: string;
	modifiedById: number;
	deletedDate: string;
	deletedById: number;
};

export type PaymentGatewayResponseObject = APIResponseObject & { data: PaymentGatewayTypes };
export type PaymentGatewayResponseArray = APIResponseObject & { data: Array<PaymentGatewayTypes> };