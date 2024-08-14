import { BiometricsEntryType } from "@helpers/commonEnums";
import { APIResponseObject } from "@modules/Common/common.interface";
import { UserTypes } from "@modules/User/types";

export interface BiometricType {
	id: number
	mode: string
	checkIn: string
	type: number
	userId: number
	addedById: number
	biometricsJobId: number
	latitude: string 
	longitude: string
	addedDate: string
	modifiedDate?: string
	AddedBy?: Partial<UserTypes>,
	ModifiedBy?: Partial<UserTypes>,
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

export interface BiometricParams {
	mode: "in" | "out"
	fromDate: string | Date
	toDate: string | Date
	type: BiometricsEntryType
	userId: number
	perPage: number
	page: number
}

export type BiometricResponseObject = APIResponseObject & { data: BiometricType };
export type BiometricResponseArray = APIResponseObject & {
	data: Array<BiometricType>;
};
