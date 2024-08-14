import { APIResponseObject } from "../Common/common.interface";

export type LanguageType = {
	id: number;
	name: string;
	code: string;
	nativeName: string;
	isPublished: boolean;
	isDeleted: boolean;
};

export type LanguageTypeResponseObject = APIResponseObject & { data: LanguageType };
export type LanguageTypeResponseArray = APIResponseObject & { data: Array<LanguageType> };
