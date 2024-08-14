import { APIResponseObject } from "../Common/common.interface";

export type PayrollCycleType = {
    id:            number;
    fromDate:      Date;
    toDate:        Date;
    success:       number;
    failed:        number;
    failedReport:  string[] | null;
    addedDate:     Date;
    processed:     boolean;
    processing:    boolean;
    processedDate: Date;
};

export type PayrollCycleResponseObject = APIResponseObject & { data: PayrollCycleType };
export type PayrollCycleResponseArray = APIResponseObject & {
	data: Array<PayrollCycleType>;
};
