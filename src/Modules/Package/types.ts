import { APIResponseObject } from "../Common/common.interface";

export type PackageTypes = {
    id: number;
    slug: string;
    credits: number;
    icon?: string;
    countryId?: number;
    level: number;
    isDefault: boolean;
    makeFeatured: boolean;
    makePremium: boolean;
    duration: number;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: Date;
    addedById?: number;
    modifiedDate?: Date;
    modifiedById?: number;
    deletedDate?: Date;
    deletedById?: number;
    localization: PackageLocalization[];
}

// Package Localization
export type PackageLocalization = {
    language: string
    title: string
    description?: string
    packageId: number
}

export type PackageResponseObject = APIResponseObject & { data: PackageTypes };
export type PackageResponseArray = APIResponseObject & { data: Array<PackageTypes> };
