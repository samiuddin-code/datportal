import { FormDataHeader } from "@modules/Common/config";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { APIResponseObject } from "../Common/common.interface";
import { ReimbursementDetailType, ReimbursementQuery, ReimbursementType, financeActionReimbursement, hrActionReimbursement } from "./types";

export class ReimbursementModule {
	private readonly endPoint = "reimbursement";

	getAllRecords = (query?: Partial<ReimbursementQuery>) => {
		return apiInstance.get<APIResponseObject & { data: ReimbursementType[] }>(BASE_URL + this.endPoint, {
			params: {
				sortByField: 'order',
				sortOrder: 'asc',
				perPage: 4,
				...query
			}
		});
	};
	getOwnRecords = (query?: Partial<ReimbursementQuery>) => {
		return apiInstance.get<APIResponseObject & { data: ReimbursementType[] }>(BASE_URL + this.endPoint + "/own", {
			params: {
				...query
			}
		});
	};

	getRecordById = (id: number) => {
		return apiInstance.get<{ data: ReimbursementDetailType }>(BASE_URL + this.endPoint + "/findOne/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/remove/" + id);
	};

	createRecord = (data: FormData) => {
		return apiInstance.post(BASE_URL + this.endPoint, data, { headers: FormDataHeader });
	};

	/**
	 * Update Reimbursement
	 * @param {number} id - Reimubursement Id
	 */
	withdrawReimbursement = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/withdraw/${id}`);
	}
	/**
		 * Update Order
		 * @param {hrActionReimbursement} data - Order Number
		 * @param {number} id - Record Id
		 */
	hrActionReimbursement = (data: Partial<hrActionReimbursement>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/hrAction/${id}`, data);
	}
	/**
		 * Update Order
		 * @param {financeActionReimbursement} data - Order Number
		 * @param {number} id - Record Id
		 */
	financeActionReimbursement = (data: Partial<financeActionReimbursement>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/financeAction/${id}`, data);
	}

}