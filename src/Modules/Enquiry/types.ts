import { EnquirySource, EnquiryStatus } from "@helpers/commonEnums";
import { APIResponseObject, TypeFromEnumValues } from "../Common/common.interface";
import { UserTypes } from "@modules/User/types";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { Moment } from "moment";

export type EnquiryType = {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    phoneCode: string;
    message: string;
    source: keyof typeof EnquirySource;
    userAgent: string;
    userIP: string;
    reference: string;
    isDeleted: boolean;
    status: number;
    addedDate: string;
    hasReplied: boolean;
    timeDifference: number;
    repliedDate: string;
    modifiedDate: string;
    addedById: number;
    modifiedById: number;
    assignedToId: number;
    AssignedTo: UserTypes;
    assignedById: number;
    LeadEnquiryFollowUp: LeadEnquiryFollowUp[];
    projectTypeId: number;
    ProjectType: ProjectTypeType
    Attachments: AttachmentType[]
};

export type EnquiryNotesType = {
    id: number;
    note: string;
    addedDate: Date;
    addedById: number;
    enquiryId: number;
    isConcern: boolean;
    isResolved: boolean;
    leadId: number;
    isDeleted: boolean;
    AddedBy: UserTypes;
};

export type AttachmentType = {
    id: number,
    title: string,
    file: string,
    mimeType: string,
    addedDate: string,
    enquiryId: number,
    leadId: number,
    isDeleted: boolean,
}

export type AutoCreateLeadTypes = {
    clientType: number;
    projectTypeId: number,
    clientId: number,
    enquiryId: number,
    message: string
    assignedToId: number
    submissionById: number
    dueDateForSubmissions: Moment
}

export type EnquiryParamTypes = {
    status: TypeFromEnumValues<typeof EnquiryStatus>
    email: string
    phone: string
    fromDate: string
    toDate: string
    name: string
    source: keyof typeof EnquirySource
    userAgent: string
    userIP: string
    hasConcerns: boolean
    assignedToId: number
}

export type EnquiryStatusCounts = {
    all: number
    active: number
    qualified: number
    unqualified: number
    hasConcerns: number
    spam: number
}

export type LeadEnquiryFollowUp = EnquiryNotesType

export type EnquiryTypeResponseObject = APIResponseObject & { data: EnquiryType };
export type EnquiryTypeResponseArray = APIResponseObject & { data: Array<EnquiryType> };