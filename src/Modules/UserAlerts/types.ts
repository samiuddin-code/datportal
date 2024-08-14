import { APIResponseObject } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";
import { UserTypes } from "../User/types";

export type UserAlertsTypes = {
    id: number;
    userId: number;
    user: UserTypes
    filters: UserAlertsFiltersTypes;
    interval: number;
    addedDate: string;
    modifiedDate: string;
    lastSent: string;
    countryId: number;
    isPublished: boolean;
    country: CountryTypes;
}

export type UserAlertsFiltersTypes = {
    userIds: number[];
    location: number[];
    type: string;
    maxArea: number;
    minArea: number;
    bedrooms: string[];
    category: string;
    maxPrice: number;
    minPrice: number;
    bathrooms: string[];
    rentalPeriod: string;
    agency: number;
    isPublished: boolean;
}

export type UserAlertsResponseObject = APIResponseObject & { data: UserAlertsTypes };
export type UserAlertsResponseArray = APIResponseObject & { data: Array<UserAlertsTypes> };