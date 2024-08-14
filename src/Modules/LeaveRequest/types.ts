import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export interface LeaveRequestType {
    id: number;
    requestById: number;
    typeOfLeave: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    purpose: string;
    leaveFrom: Date;
    leaveTo: Date;
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    addedDate: Date;
    submittedDate: Date;
    RequestBy: UserTypes;
    AdminActions: AdminAction[];
    _count: Count;
}

export interface Count {
    AdminActions: number;
    Attachments: number;
}

export interface LeaveRequestDetailType {
    id: number;
    requestById: number;
    typeOfLeave: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    purpose: string;
    leaveFrom: Date;
    leaveTo: Date;
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    addedDate: Date;
    AdminActions: AdminAction[];
    Attachments: Attachments[];
    RequestBy: UserTypes;
}

export interface Attachments {
    id: number;
    title: string;
    file: string;
    mimeType: string;
    claimedAmount: number;
    approvedAmount: number;
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    comment: string;
    addedDate: Date;
    LeaveRequestId: number;
}

export type LeaveRequestQuery = {
    userId?: number;
    perPage?: number;
    page?: number;
}

export interface hrActionLeaveRequest {
    comment: string;
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export interface financeActionLeaveRequest {
    comment: string;
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface AdminAction {
    id: number;
    departmentId: number;
    actionById: number;
    status: number;
    comment: string;
    addedDate: Date;
    LeaveRequestId: number;
    leaveRequestId: number;
    carReservationRequestId: number;
    LeaveRequestRequestId: number;
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
export type LeaveRequestResponseObject = APIResponseObject & { data: LeaveRequestType };
export type LeaveRequestResponseArray = APIResponseObject & {
    data: Array<LeaveRequestType>;
};
