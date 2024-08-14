import { APIResponseObject } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";

export type CreditsPackageTypes = {
    id: number;
    slug: string;
    credits: number;
    amount: number;
    autoRenew: boolean;
    packageType: 'monthly' | 'onetime';
    icon: string;
    countryId: number;
    level: number;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: Date;
    addedById: number;
    modifiedDate: Date;
    modifiedById: number;
    deletedDate: Date;
    deletedById: number;
    localization: CreditPackageLocalization[];
    country: CountryTypes;
};

// Credits package Localization
export type CreditPackageLocalization = {
    title: string;
    description?: string;
}

export type CreditsPackageResponseObject = APIResponseObject & { data: CreditsPackageTypes };
export type CreditsPackageResponseArray = APIResponseObject & { data: Array<CreditsPackageTypes> };
