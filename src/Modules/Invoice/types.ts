import { APIResponseObject, TypeFromEnumValues } from "../Common/common.interface";
import { ProjectTypes } from "@modules/Project/types";
import { ClientType } from "@modules/Client/types";
import { InvoiceStatus } from "@helpers/commonEnums";
import { QuotationTypes } from "@modules/Quotation/types";
import { LeadEnquiryFollowUp } from "@modules/Enquiry/types";

export type InvoiceTypes = {
    id: number;
    title: string;
    message: string;
    projectId: number;
    clientId: number;
    amount: number;
    vatAmount: number;
    total: number;
    type: number;
    hasSupervisionCharge: boolean;
    status: number;
    file: any;
    isDeleted: boolean;
    addedDate: string;
    sentDate: string;
    modifiedDate: string;
    addedById: number;
    modifiedById: number
    Quotation: QuotationTypes;
    QuotationMilestone: QuotationTypes['QuotationMilestone']
    Project: ProjectTypes;
    InvoiceItems: InvoiceItemsTypes[];
    Client: ClientType
    invoiceNumber: string;
    InvoiceFollowUp: LeadEnquiryFollowUp[];
};

export type InvoiceItemsTypes = {
    id: number;
    title: string;
    amount: number;
    invoiceId: number;
}

export type InvoiceParams = {
    id: number;
    projectId: number;
    clientId: number;
    projectTypeId: number;
    __status: TypeFromEnumValues<typeof InvoiceStatus>[]
    fromDate: string;
    toDate: string;
    hasConcerns: boolean;
    invoiceNumber: string;
}

export type InvoiceStatusCounts = {
    all: number,
    active: number,
    paid: number,
    draft: number,
    canceled: number,
    hasConcerns: number
}