import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export interface ReimbursementType {
    id: number;
    claimedAmount: number;
    requestById: number;
    approvedAmount: number;
    purpose: string;
    status: 1 | 2 | 3 | 4 | 5 | 6;
    isDeleted: boolean;
    addedDate: Date;
    AdminActions: any[];
    RequestBy: UserTypes;
    _count: Count;
}

export interface Count {
    AdminActions: number;
    ReimbursementReceipt: number;
}

export interface ReimbursementDetailType {
    id: number;
    claimedAmount: number;
    requestById: number;
    approvedAmount: number;
    purpose: string;
    status: 1 | 2 | 3 | 4 | 5 | 6;
    isDeleted: boolean;
    addedDate: Date;
    AdminActions: AdminAction[];
    ReimbursementReceipt: ReimbursementReceipt[];
    RequestBy: UserTypes;
}

export interface ReimbursementReceipt {
    id: number;
    title: string;
    file: string;
    mimeType: null;
    claimedAmount: number;
    approvedAmount: number;
    status: 1 | 2 | 3 | 4 | 5 | 6;
    comment: string;
    addedDate: Date;
    reimbursementId: number;
}

export type ReimbursementQuery = {
    userId?: number;
    perPage?: number;
    page?: number;
}

export interface hrActionReimbursement {
    comment: string;
    reimbursementReceipts: ReimbursementReceiptHR[];
}
export interface financeActionReimbursement {
    comment: string;
    status: 1 | 2 | 3 | 4 | 5 | 6;
}

export type ReimbursementReceiptHR = {
    receiptId: number;
    approvedAmount: number;
    comment: string;
    status: 1 | 2 | 3 | 4 | 5 | 6;
}
export interface AdminAction {
    id: number;
    departmentId: number;
    actionById: number;
    status: number;
    comment: string;
    addedDate: Date;
    reimbursementId: number;
    leaveRequestId: null;
    carReservationRequestId: null;
    cashAdvanceRequestId: null;
    Department: Department;
    ActionBy: ActionBy;
}

export interface ActionBy {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: string;
    phone: string;
    phoneCode: string;
}

export interface Department {
    id: number;
    title: string;
    slug: "hr" | "finance";
}
export type ReimbursementResponseObject = APIResponseObject & { data: ReimbursementType };
export type ReimbursementResponseArray = APIResponseObject & {
    data: Array<ReimbursementType>;
};
