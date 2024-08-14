import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export interface CashAdvanceType {
  id: number;
  requestById: number;
  requestAmount: number;
  purpose: string;
  approvedAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  addedDate: Date;
  submittedDate: Date;
  AdminActions: any[];
  RequestBy: UserTypes;
  _count: Count;
}

export interface Count {
  AdminActions: number;
  Attachments: number;
}

export interface CashAdvanceDetailType {
  id: number;
  requestById: number;
  requestAmount: number;
  purpose: string;
  approvedAmount: number;
  RequestBy: UserTypes;
  numberOfInstallments: number;
  installmentAmount: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  addedDate: Date;
  AdminActions: AdminAction[];
  Attachments: Attachments[];
  Installments: {
    id: number;
    cashAdvanceRequestId: number;
    amount: number;
    isPaid: boolean;
    monthYear: Date;
    paidDate: Date;
  }[]
}

export interface Attachments {
  id: number;
  title: string;
  file: string;
  mimeType: string;
  claimedAmount: number;
  approvedAmount: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  comment: string;
  addedDate: Date;
  CashAdvanceId: number;
}

export type CashAdvanceQuery = {
  userId?: number;
  perPage?: number;
  page?: number;
}

export interface hrActionCashAdvance {
  comment: string;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  approvedAmount: number;
}
export interface financeActionCashAdvance {
  comment: string;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  numberOfInstallments: number;
}

export interface AdminAction {
  id: number;
  departmentId: number;
  actionById: number;
  status: number;
  comment: string;
  addedDate: Date;
  CashAdvanceId: number;
  leaveRequestId: number;
  carReservationRequestId: number;
  cashAdvanceRequestId: number;
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
export type CashAdvanceResponseObject = APIResponseObject & { data: CashAdvanceType };
export type CashAdvanceResponseArray = APIResponseObject & {
  data: Array<CashAdvanceType>;
};
