import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export interface PayrollType {
    id:                            number;
    monthYear:                     Date;
    userId:                        number;
    salaryId:                      number;
    payrollCycleId:                number;
    totalWorkingDays:              number;
    totalDays:                     number;
    totalDaysWorked:               number;
    totalLates:                    number;
    totalIncompletes:              number;
    manualCorrection:              number;
    totalAbsences:                 number;
    toBeDeductedFromLeaveCredits:  number;
    toBeDeductedFromCurrentSalary: number;
    totalDeduction: number;
    salaryAmount: number;
    otherAmount: number;
    note: string;
    totalReceivable: number;
    file: null;
    isDeleted: boolean;
    processing: boolean;
    addedDate: Date;
    paid: boolean;
    paidDate: Date;
    modifiedById: number;
    modifiedDate: Date;
    User: UserTypes;
    ModifiedBy: any;
    PayrollCycle: PayrollCycle;
    Deductions: Deduction[];
}

export interface Deduction {
    id: number;
    payrollId: number;
    installmentId: number;
    title: string;
    amount: number;
}

export interface PayrollCycle {
    id: number;
    fromDate: Date;
    toDate: Date;
}

export enum ReportType {
    "all" = "all",
    "users" = "users",
    "department" = "department",
    "organization" = "organization",
}

export type PayrollReportType = {
    payrollCycleId: number,
    reportType: keyof typeof ReportType,
    userIds?: number[],
    departmentId?: number
    organizationId?: number
}

export type PayrollResponseObject = APIResponseObject & { data: PayrollType };
export type PayrollResponseArray = APIResponseObject & {
    data: Array<PayrollType>;
};
