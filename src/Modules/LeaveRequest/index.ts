import { FormDataHeader } from "@modules/Common/config";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { APIResponseObject } from "../Common/common.interface";
import { LeaveRequestDetailType, LeaveRequestQuery, LeaveRequestType, financeActionLeaveRequest, hrActionLeaveRequest } from "./types";

export class LeaveRequestModule {
	private readonly endPoint = "leave-request";

	getAllRecords = (query?: Partial<LeaveRequestQuery>) => {
		return apiInstance.get<APIResponseObject & { data: LeaveRequestType[] }>(BASE_URL + this.endPoint, {
			params: {
				sortByField: 'order',
				sortOrder: 'asc',
				perPage: 4,
				...query
			}
		});
	};
	getOwnRecords = (query?: Partial<LeaveRequestQuery>) => {
		return apiInstance.get<APIResponseObject & { data: LeaveRequestType[] }>(BASE_URL + this.endPoint + "/own", {
			params: {
				...query
			}
		});
	};
	getRecordById = (id: number) => {
		return apiInstance.get<{ data: LeaveRequestDetailType }>(BASE_URL + this.endPoint + "/findOne/" + id);
	};
	getLeavesRecordById = (id: number) => {
		return apiInstance.get<{
			data: {
				paidLeaves?: number;
				unpaidLeaves?: number;
				totalLeaveCredits?: number;
				remainingLeaves?: number;
			}
		}>(BASE_URL + this.endPoint + "/findLeavesReportOfUser/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/remove/" + id);
	};

	createRecord = (data: FormData) => {
		return apiInstance.post(BASE_URL + this.endPoint, data, { headers: FormDataHeader });
	};

	/**
	 * Update LeaveRequest
	 * @param {number} id - LeaveRequest Id
	 */
	withdrawLeaveRequest = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/withdraw/${id}`);
	}
	/**
		 * Update Order
		 * @param {hrActionLeaveRequest} data - Order Number
		 * @param {number} id - Record Id
		 */
	employeeActionLeaveRequest = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/submitRequest/${id}`);
	}
	/**
		 * Update Order
		 * @param {hrActionLeaveRequest} data - Order Number
		 * @param {number} id - Record Id
		 */
	hrActionLeaveRequest = (data: hrActionLeaveRequest, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/hrAction/${id}`, data);
	}
	/**
		 * Update Order
		 * @param {hrActionLeaveRequest} data - Order Number
		 * @param {number} id - Record Id
		 */
	projectManagerActionLeaveRequest = (data: hrActionLeaveRequest, id: number) => {
		console.log(id, 'id')
		return apiInstance.patch(BASE_URL + this.endPoint + `/projectManagerAction/${id}`, data);
	}
	/**
		 * Update Order
		 * @param {financeActionLeaveRequest} data - Order Number
		 * @param {number} id - Record Id
		 */
	financeActionLeaveRequest = (data: financeActionLeaveRequest, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/financeAction/${id}`, data);
	}

}