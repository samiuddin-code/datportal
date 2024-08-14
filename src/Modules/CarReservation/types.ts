import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export interface CarReservationType {
    id: number;
    fromDate: Date;
    toDate: Date;
    requestById: number;
    projectId: number;
    companyCarId: number;
    purpose: string;
    status: 1 | 2 | 3 | 4 | 5;
    addedDate: Date;
    AdminActions: AdminAction[];
    RequestBy: UserTypes;
    _count: Count;
}

export interface Count {
    AdminActions: number;
    Attachments: number;
}

export interface CarReservationDetailType {
    id: number;
    fromDate: Date;
    toDate: Date;
    requestById: number;
    projectId: number;
    companyCarId: number;
    purpose: string;
    status: 1 | 2 | 3 | 4 | 5;
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
    status: 1 | 2 | 3 | 4 | 5;
    comment: string;
    addedDate: Date;
    LeaveRequestId: number;
}

export type CarReservationQuery = {
    userId?: number;
    perPage?: number;
    page?: number;
    fetchOpenRequest?: boolean;
}

export interface hrActionCarReservation {
    comment: string;
    status: 1 | 2 | 3 | 4 | 5;
    companyCarId: number,
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
export type CarReservationResponseObject = APIResponseObject & { data: CarReservationType };
export type CarReservationResponseArray = APIResponseObject & {
    data: Array<CarReservationType>;
};
