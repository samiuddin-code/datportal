// src/types/QuotationTypes.ts

import { LeadsTypes } from "@modules/Leads/types";
import { APIResponseObject, TypeFromEnumValues } from "../Common/common.interface";
import { QuotationStatus } from "@helpers/commonEnums";

export type QuotationTypes = {
    id: number;
    leadId: number;
    scopeOfWork: string;
    file: string;
    type: number;
    status: number;
    isDeleted: boolean;
    addedDate: string;
    sentDate: string;
    modifiedDate: string;
    addedById: number;
    modifiedById: number;
    totalAmount: number;
    hasSupervision: boolean;
    supervisionMonthlyCharge: number;
    supervisionPaymentSchedule: number;
    
    QuotationMilestone: QuotationMilestone[];
    Lead: LeadsTypes;
    projectId: number;
    xeroReference: string;
    revisedQuotationReferenceId: number;
    revisionCount: number;
    quoteNumber: string;
    subTotal: number;
    vatAmount: number;
    total: number;
    brandingThemeId: number;
    clientId: number;
    issueDate: string;
    expiryDate: string;
    paymentTerms: string[]; 
};

export type QuotationMilestone = {
    id: number;
    title: string;
    amount: number;
    quotationId: number;
    invoiceId: number;
    status: number;
    type?: "supervision" | "milestone";
    quantity?: number;
    description?: string;
    paymentTerms?: string;
}

export type QuotationFormType = {
    leadId: number;
    revisedQuotationReferenceId: number;
    totalAmount: number;
    hasSupervision: boolean;
    supervisionMonthlyCharge: number;
    supervisionPaymentSchedule: number;
    scopeOfWork: string;
    paymentTerms: string;
    milestone: { title: string; amount: number }[];
    type: number;
    file: any;
}


export type QuotationParams = {
    projectId: number;
    clientId: number;
    projectTypeId: number;
    __status: TypeFromEnumValues<typeof QuotationStatus>[];
    fromDate: string;
    toDate: string;
    quoteNumber: string;
    assignedToId: number;
}

export type QuotationTypeResponseObject = APIResponseObject & { data: QuotationTypes };
export type QuotationTypeResponseArray = APIResponseObject & { data: Array<QuotationTypes> };
