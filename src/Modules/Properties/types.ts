import { AreaUnit } from '../../Redux/Reducers/AreaUnitReducer/types';
import { PropertyCategoryType } from '../PropertyCategory/types';
import { LocationType } from '../Location/types';
import { SupportedLanguages } from '../../helpers/commonEnums';
import { APIResponseObject } from '../Common/common.interface';
import { UserTypes } from '../User/types';
import { PackageTypes } from '../Package/types';
import { OrganizationType } from '../Organization/types';

export type PropertiesType = {
    id: number;
    slug: string;
    agencyId: number;
    bedrooms: string;
    bathrooms: string;
    completionStatus: string;
    size: number;
    sizeUnit: string;
    areaUnit: AreaUnit;
    priceOnApplication: boolean;
    premium: boolean;
    verified: boolean;
    featured: boolean;
    price: number;
    rentalFrequency?: string;
    yearlyPrice: number;
    monthlyPrice: number;
    weeklyPrice: number;
    dailyPrice: number;
    deliveryDate: Date;
    fixedPrice: number;
    currency: string;
    view360?: string;
    status: number;
    addedDate: Date;
    qualityScore: number;
    propertyScoring: PropertyScoringTypes[];
    addedByRelation: AddedByRelationType;
    assignedTo: AddedByRelationType
    assignedBy: AddedByRelationType;
    category: PropertyCategoryType;
    creditsTransactions: CreditsTransactionsType[];
    agency: OrganizationType;
    type: Type_Types;
    localization: PropertiesTypeLocalization[];
    resources: Resource[];
    propertyLocation: PropertyLocation[];
    propertyTypeId: number;
    propertyAmenityRelation: PropertyAmenityRelationType[];
    furnished: string;
    parking: string;
    reference: string | number;
    permitNumber: number;
    reraPermitNumber: number;
    titleDeed: number;
    chequesCount: string;
    yearlyService: number
    isPublished: boolean;
    isProcessing?: boolean;
    leads: { id: number }[];
}

export type CreditsTransactionsType = {
    id: number;
    user: UserTypes;
    transactionDate: string;
    expiresAt: string;
    autoRenew: boolean;
    package: PackageTypes;
}

export type PropertiesTypeLocalization = {
    title: string,
    language: SupportedLanguages,
    description: string
}

export type PropertyAmenityRelationType = {
    amenityId: number;
    id: number;
    propertyId: number;
    amenity: {
        id: number;
        icon: string;
        localization: { title: string; }[]
    }
}

export type AddedByRelationType = {
    id: number;
    uuid: string;
    profile: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneCode: string;
    whatsapp: null;
    displayOrgContact: boolean;
}

export type AreaUnitLocalization = {
    title: string;
}


export type PropertyLocation = {
    location: LocationType;
}

export type Resource = {
    id: number;
    file: string;
    name: string;
    fileType: string;
    path: string;
    documentType: string;
    comments: string;
    uuid: string;
    title: string;
    status: number;
    visibility: string;
    height: number;
    width: number;
    isDuplicate: boolean;
    duplicateId: number;
    duplicatePath: string;
}

// query params types
export type PROPERTIES_QUERY_TYPES = {
    title: string;
    perPage: number;
    page: number;
    sortByField: string;
    sortOrder: string;
    id: number;
    location: number[];
    categoryId: number[];
    typeIds: number[];
    __bedrooms: number[];
    __bathrooms: number[];
    rentalPeriod: string;
    minPrice: number;
    maxPrice: number;
    minArea: number;
    maxArea: number;
    furnishingStatus: string;
    country: number;
    featured: boolean;
    isPublished: boolean;
    agencyId: number;
    agentIds: number[];
    status: string;
    slug: string;
    fromDate: string;
    toDate: string;
}

// types for type
export type Type_Types = {
    localization: AreaUnitLocalization[];
}

//propertyScoring types
export type PropertyScoringTypes = {
    id: number;
    propertyId: number;
    title: string;
    slug: string;
    info: string;
    message: string;
    status: number;
    score: number;
    totalScore: number;
}


// Property Logs Types
export type PropertyLogsTypes = {
    id: number;
    table: string;
    tableColumnKey: string;
    tableColumnValue: string;
    valueType: string;
    actionType: string;
    message: string;
    endPoint: string;
    controllerName: string;
    data: Data;
    countryId: number;
    organizationId: number;
    addedDate: Date;
    addedById: number;
    addedBy: AddedBy;
}

export type AddedBy = {
    firstName: string;
    lastName: string;
    profile: string;
}

export type Data = {
    files: string[];
    parking: string;
    location: Location;
    amenities: number[];
    countryId: number;
    furnished: string;
    reference: string;
    titleDeed: null;
    modifiedBy: number;
    priceTypes: PriceType[];
    chequesCount: string;
    deliveryDate: Date;
    modifiedDate: Date;
    permitNumber: number;
    translations: Translation[];
    propertyTypeId: number;
    reraPermitNumber: number;
    propertyCategoryId: number;
}

export type Location = {
    stateId: number;
    buildingId: number;
    communityId: number;
    subCommunityId: number;
}

export type PriceType = {
    price: number;
    priceTypeSlug: string;
}

export type Translation = {
    title: string;
    language: string;
    isDefault: number;
    description: string;
}

// Property Deals
export type PropertyDealTypes = {
    id: number;
    propertyId: number;
    userId?: number;
    user: UserTypes;
    caption?: string;
    media?: string;
    mediaType?: "image" | "video";
    discountType?: "flat" | "percentage";
    thumbnail: string;
    value?: number;
    property: PropertiesType;
    addedDate: Date;
    isDeleted?: boolean;
    deletedDate?: Date;
    _count: { propertyDealsViews: number }
}

export type PropertyDocTypes = {
    id: number;
    uuid: string;
    documentType: string;
    title: string;
    file: string;
    fileType: string;
    name: string;
    path: string;
    description: string;
    order: number;
    comments: string;
    visibility: string;
    condition: Condition;
    propertyId: number;
    isTemp: boolean;
    hash: string;
    isDuplicate: boolean;
    duplicateId: number;
    duplicatePath: string;
    height: number;
    width: number;
    status: number;
    isDeleted: boolean;
    isDefault: boolean;
    isProcessing: boolean;
    backgroundId: number;
    isValid: boolean;
    validationMessage: string;
    addedDate: string;
    modifiedDate: string;
    deletedDate: string;
    addedBy: number;
    modifiedBy: number;
    deletedBy: number;
    agencyId: number;
    verifiedDate: string;
    verifiedByUserId: string;
    agency: Agency;
    addedByRelation: AddedByRelation;
}

export type AddedByRelation = {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    profile: string;
}

export type Agency = {
    id: number;
    uuid: string;
    logo: string;
    localization: Localization[];
}

export type Localization = {
    name: string;
}

/** Property Analytics Types */
export interface PropertyAnalyticsTypes {
    _sum: SumTypes;
    startDate: string;
}

export interface SumTypes {
    views: number;
    impression: number;
}

export type Condition = any;
// Property Response
export type PropertiesTypeResponseObject = APIResponseObject & { data: PropertiesType };
export type PropertiesTypeResponseArray = APIResponseObject & { data: Array<PropertiesType> };

// Property Deals Response
export type PropertyDealResponseObject = APIResponseObject & { data: PropertyDealTypes };
export type PropertyDealResponseArray = APIResponseObject & { data: Array<PropertyDealTypes> };
