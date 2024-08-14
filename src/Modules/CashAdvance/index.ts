import { FormDataHeader } from "@modules/Common/config";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { APIResponseObject } from "../Common/common.interface";
import { CashAdvanceDetailType, CashAdvanceQuery, CashAdvanceType, financeActionCashAdvance, hrActionCashAdvance } from "./types";

export class CashAdvanceModule {
	private readonly endPoint = "cash-advance";

	getAllRecords = (query?: Partial<CashAdvanceQuery>) => {
		return apiInstance.get<APIResponseObject & { data: CashAdvanceType[] }>(BASE_URL + this.endPoint, {
			params: {
				sortByField: 'order',
				sortOrder: 'asc',
				perPage: 4,
				...query
			}
		});
	};

	getOwnRecords = (query?: Partial<CashAdvanceQuery>) => {
		return apiInstance.get<APIResponseObject & { data: CashAdvanceType[] }>(BASE_URL + this.endPoint + "/own", {
			params: {
				...query
			}
		});
	};

	getRecordById = (id: number) => {
		return apiInstance.get<{ data: CashAdvanceDetailType }>(BASE_URL + this.endPoint + "/findOne/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/remove/" + id);
	};

	createRecord = (data: FormData) => {
		return apiInstance.post(BASE_URL + this.endPoint, data, { headers: FormDataHeader });
	};

	/**
	 * Update CashAdvance
	 * @param {number} id - Cash Advacne Id
	 */
	withdrawCashAdvance = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/withdraw/${id}`);
	}
	/**
		 * Update Order
		 * @param {hrActionCashAdvance} data - Order Number
		 * @param {number} id - Record Id
		 */
	hrActionCashAdvance = (data: hrActionCashAdvance, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/hrAction/${id}`, data);
	}
	/**
		 * Update Order
		 * @param {financeActionCashAdvance} data - Order Number
		 * @param {number} id - Record Id
		 */
	financeActionCashAdvance = (data: financeActionCashAdvance, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/financeAction/${id}`, data);
	}

}