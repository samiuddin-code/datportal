import { APIResponseObject } from "../Common/common.interface";

export type PromotionTypes = {
	id: number;
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
	modifiedDate: string;
	modifiedById: number;
	deletedDate: string;
	deletedById: number;
	localization: PromotionLocalization[];
	creditPackagePromotions: CreditPackagePromotion[];
	packagePromotions: PackagePromotion[];
};

export type CreditPackagePromotion = {
	id: number;
	creditPackageId: number;
	creditPackage: CreditPackage;
}

export type CreditPackage = {
	slug: string;
	localization: PromotionLocalization[];
}

export type PromotionLocalization = {
	language: string;
	title: string;
	description: string;
	promotionId: number;
	isDefault: number;
}

export type PackagePromotions = {
	packagePromotions: PackagePromotion[];
}

export type PackagePromotion = {
	id: number;
	packageId: number;
	package: Package;
}

export type Package = {
	slug: string;
	localization: PromotionLocalization[];
}

export type PromotionResponseObject = APIResponseObject & { data: PromotionTypes };
export type PromotionResponseArray = APIResponseObject & { data: Array<PromotionTypes> };