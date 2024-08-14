import { APIResponseObject } from "../../Common/common.interface";

export type BulkUploadFormatTypes = {
	id: number,
	title: string,
	format: any,
	sample: any,
	organizationIds: string[],
	comment: string,
	addedDate: string,
};

export type BulkUploadFormatResponseObject = APIResponseObject & { data: BulkUploadFormatTypes };
export type BulkUploadFormatResponseArray = APIResponseObject & { data: Array<BulkUploadFormatTypes> };