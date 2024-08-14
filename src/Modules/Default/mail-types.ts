import { APIResponseObject } from "../Common/common.interface";

export type MailLogsTypes = {
    id: number;
    subject: string;
    calleFunction: string;
    email: string;
    data: Data;
    template: string;
    addedDate: Date;
}

export type Data = {
    lastName: string;
    property: Property[];
    firstName: string;
    emailTitle: string;
    hideFooter: boolean;
    facebookUrl: string;
    linkedInUrl: string;
    instagramUrl: string;
    privacyPolicy: string;
    frontendDomain: string;
    termsCondition: string;
    unsubscribeUrl: string;
    allPropertyLink: string;
    unsubscribeLink: string;
    notificationPreferences: string;
}

export type Property = {
    id: number;
    size: number;
    slug: string;
    type: Type;
    price: number;
    agency: Agency;
    status: number;
    premium: boolean;
    view360: string;
    agencyId: number;
    areaUnit: AreaUnit;
    bedrooms: string;
    category: Category;
    currency: string;
    featured: boolean;
    sizeUnit: string;
    verified: boolean;
    addedDate: Date;
    bathrooms: string;
    resources: Resource[];
    dailyPrice: number;
    dynamicSEO: boolean;
    fixedPrice: number;
    weeklyPrice: number;
    yearlyPrice: number;
    localization: PropertyLocalization[];
    monthlyPrice: number;
    qualityScore: number;
    addedByRelation: AddedByRelation;
    propertyScoring: PropertyScoring[];
    rentalFrequency: string;
    propertyLocation: PropertyLocation[];
    priceOnApplication: boolean;
    creditsTransactions: any[];
}

export type AddedByRelation = {
    id: number;
    uuid: string;
    email: string;
    phone: string;
    profile: string;
    lastName: string;
    whatsapp: string;
    firstName: string;
    phoneCode: string;
    displayOrgContact: boolean;
}

export type Agency = {
    logo: string;
    uuid: string;
    email: string;
    phone: string;
    whatsapp: string;
    phoneCode: string;
}

export type AreaUnit = {
    id: number;
    name: string;
    rate: number;
    symbol: string;
    isDeleted: boolean;
    isPublished: boolean;
}

export type Category = {
    slug: string;
}

export type PropertyLocalization = {
    title: string;
}

export type PropertyLocation = {
    location: Location;
}

export type Location = {
    localization: LocationLocalization[];
}

export type LocationLocalization = {
    name: string;
    pathName: string;
}

export type PropertyScoring = {
    id: number;
    info: string;
    slug: string;
    score: number;
    title: string;
    status: number;
    message: string;
    propertyId: number;
    totalScore: number;
}

export type Resource = {
    file: string;
    path: string;
}

export type Type = {
    localization: PropertyLocalization[];
}

export type MailLogsFiltersTypes = {
    fromDate: string;
    toDate: string;
    subject: string;
    email: string;
    template: string;
}

export type MailLogsResponseObject = APIResponseObject & { data: MailLogsTypes };
export type MailLogsResponseArray = APIResponseObject & { data: Array<MailLogsTypes> };