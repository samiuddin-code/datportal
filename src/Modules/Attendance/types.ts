import { AttendanceEntryType, AttendanceStatus } from "@helpers/commonEnums";
import { APIResponseObject } from "@modules/Common/common.interface";
import { LeaveTypeType } from "@modules/LeaveType/types";
import { UserTypes } from "@modules/User/types";
import { WorkingHourType } from "@modules/WorkingHours/types";

export interface AttendanceType {
	id: number
	userId: number
	type: number
	checkIn: string
	checkOut: string
	totalHours: number
	note: string
	addedById: number
	addedDate: string
	isOnLeave: boolean
	day: Date
	User: {
		id: number;
		uuid: string;
		firstName: string;
		lastName: string;
		email: string;
		profile: string;
		phone: string;
		phoneCode: string;
	}
}

export interface AttendanceParams {
	fromDate: string | Date
	toDate: string | Date
	type: AttendanceEntryType
	userId: number
	perPage: number
	page: number
}

export interface UserAttendance {
	attendanceData: UserAttendanceType[],
	workingHour: WorkingHourType,
	leaves: {
		id: number;
		requestById: number;
		typeOfLeave: number;
		purpose: string;
		leaveFrom: Date;
		leaveTo: Date;
		status: number;
		addedDate: Date;
		submittedDate: Date;
	}[]
	publicHolidays: {
		id: number;
		title: string;
		date: Date;
		addedById: number;
		addedDate: Date;
	}[]
}

export type UserAttendanceType = {
	recordId: number | null,
	userId: number,
	entryType?: AttendanceEntryType,
	checkIn?: Date,
	checkOut?: Date,
	day: Date,
	status: AttendanceStatus,
	note: string,
	hoursWorked: number,
	proRatedDeduction: number,
	AddedBy: Partial<UserTypes> | null,
	ModifiedBy?: Partial<UserTypes> | null,
	modifiedDate?: Date
}

export type AttendanceResponseObject = APIResponseObject & { data: AttendanceType };
export type AttendanceResponseArray = APIResponseObject & {
	data: Array<AttendanceType>;
};

export enum ReportType {
	"all" = "all",
	"users" = "users",
	"department" = "department",
	"organization" = "organization",
}

export type AttendanceReportType = {
	fromDate: Date | string,
	toDate: Date | string,
	reportType: keyof typeof ReportType,
	userIds?: number[],
	departmentId?: number
	organizationId?: number
}