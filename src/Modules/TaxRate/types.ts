import { APIResponseObject } from "@modules/Common/common.interface";

export interface TaxRateType {
	id:      number;
    taxType: string;
    title:   string;
    rate:    number;
}

export type TaxRateResponseObject = APIResponseObject & { data: TaxRateType };
export type TaxRateResponseArray = APIResponseObject & {
	data: Array<TaxRateType>;
};
