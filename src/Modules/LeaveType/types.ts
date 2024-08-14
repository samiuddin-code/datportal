import { APIResponseObject } from "../Common/common.interface";

export type LeaveTypeType = {
    id: number
    title: string
    slug: string
    isPaid: boolean
    threshold: number
    frequency: string
    addedDate: Date
    isDeleted: boolean
    isPublished: boolean
    thresholdType: string
};

export type LeaveTypeResponseObject = APIResponseObject & { data: LeaveTypeType };
export type LeaveTypeResponseArray = APIResponseObject & {
    data: Array<LeaveTypeType>;
};
