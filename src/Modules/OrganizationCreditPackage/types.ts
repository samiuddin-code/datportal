import { OrganizationType } from "../Organization/types";
import { CreditsPackageTypes } from "../CreditsPackage/types";
import { APIResponseObject } from "../Common/common.interface";

export type OrganizationCreditPackageTypes = {
	id: number;
	creditPackageId: number;
	credits: number;
	autoRenew: boolean;
	expiresAt: Date;
	status: number;
	remarks?: string;
	amount: number;
	discountValue: number;
	couponCode: string;
	offerType: string;
	offerValue: number;
	addedDate: Date;
	modifiedDate: Date;
	addedById: number;
	organizationId: number;
	creditPackage: CreditsPackageTypes;
	organization: OrganizationType;
};

export type ValidateCouponCodeType = {
	id: 1;
	promoCode: string;
	discountType: string;
	promotionFor: string;
	value: number;
	limit: number;
	validFrom: string;
	validTo: string;
	image: string;
	countryId: number;
	currencyId: number;
	isPublished: boolean;
	isDeleted: boolean;
	addedDate: string;
	addedById: number;
	modifiedDate: Date;
	modifiedById: number;
	deletedDate: Date;
	deletedById: number;
};

export type OrderDataTypes = {
	id: number;
	creditPackageId: number;
	credits: number;
	autoRenew: boolean;
	expiresAt: Date;
	status: number;
	remarks: string;
	amount: number;
	discountValue: number;
	vat: number;
	vatAmount: number;
	couponCode: string;
	offerType: string;
	offerValue: number;
	addedDate: Date;
	modifiedDate: Date;
	addedById: number;
	organizationId: number;
	creditPackage: CreditsPackageTypes;
	organization: OrganizationType;
	packageAmount: number;
}

export interface OrderTypes {
	url: string;
	cartId: string;
	orderData: OrderDataTypes;
}

// balance types
export type BalanceTypes = {
	balance: number;
	recharged: boolean;
	lastRecharged: Date;
	rechargedBy: string;
}


export type OrgCreditPackageResponseObject = APIResponseObject & { data: OrganizationCreditPackageTypes };
export type OrgCreditPackageResponseArray = APIResponseObject & { data: Array<OrganizationCreditPackageTypes> };
export type OrderTypesResponseObject = APIResponseObject & { data: OrderTypes };
export type BalanceTypesResponseObject = APIResponseObject & { data: BalanceTypes };