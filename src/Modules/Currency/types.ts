import { APIResponseObject } from "../Common/common.interface";

export type CurrencyTypes = {
	id: number;
	name: string;
	code: string;
	symbol: string;
	rate: number;
	isPublished: boolean;
	isDeleted: boolean;
};

export type CurrencyResponseObject = APIResponseObject & { data: CurrencyTypes };
export type CurrencyResponseArray = APIResponseObject & { data: Array<CurrencyTypes> };