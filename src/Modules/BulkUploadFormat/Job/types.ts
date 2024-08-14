import { TypeFromEnumValues } from "@helpers/common";
import { APIResponseObject } from "../../Common/common.interface";

export type BulkUploadJobTypes = {
	id: number;
	title: string;
	file: string;
	status: TypeFromEnumValues<typeof BiometricsJobStatus>
	totalRecords: number;
	success: number;
	failed: number;
	failedReport: FailedReport;
	uploadFormatId: number;
	addedDate: Date;
	processeStartDate: Date;
};

export enum BiometricsJobStatus {
    "new" = 1,
    "processing" = 2,
    "completed" = 3,
    "failed" = 4,
    "rollback" = 5,
    "force_stopped"
}

export type FailedReport = any

export type PropertyBulkUploadJobResponseObject = APIResponseObject & { data: BulkUploadJobTypes };
export type PropertyBulkUploadJobResponseArray = APIResponseObject & { data: Array<BulkUploadJobTypes> };