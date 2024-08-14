import { FormDataHeader } from "@modules/Common/config";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { APIResponseObject } from "../Common/common.interface";
import { CarReservationDetailType, CarReservationQuery, CarReservationType, hrActionCarReservation } from "./types";

export class  CarReservationModule {
	private readonly endPoint = "car-reservation-request";

	getAllRecords = (query?: Partial<CarReservationQuery>) => {
		return apiInstance.get<APIResponseObject & { data: CarReservationType[] }>(BASE_URL + this.endPoint, {
			params: {
				sortByField: 'order',
				sortOrder: 'asc',
				perPage: 4,
				...query
			}
		});
	};
	getOwnRecords = (query?: Partial<CarReservationQuery>) => {
		return apiInstance.get<APIResponseObject & { data: CarReservationType[] }>(BASE_URL + this.endPoint + "/own", {
			params: {
				...query
			}
		});
	};

	getRecordById = (id: number) => {
		return apiInstance.get<{ data: CarReservationDetailType }>(BASE_URL + this.endPoint + "/findOne/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/remove/" + id);
	};

	createRecord = (data: FormData) => {
		return apiInstance.post(BASE_URL + this.endPoint, data, { headers: FormDataHeader });
	};

	/**
	 * Update CarReservation
	 * @param {number} id - CarReservation Id
	 */
	withdrawCarReservation = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/withdraw/${id}`);
	}
	/**
		 * Update Order
		 * @param {hrActionCarReservation} data - Order Number
		 * @param {number} id - Record Id
		 */
	employeeActionCarReservation = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/submitRequest/${id}`);
	}
	/**
		 * Update Order
		 * @param {hrActionCarReservation} data - Order Number
		 * @param {number} id - Record Id
		 */
	hrActionCarReservation = (data: hrActionCarReservation, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/hrAction/${id}`, data);
	}
	checkAvailability = (data: { companyCarId: number, fromDate: string, toDate: string }) => {
		return apiInstance.patch(BASE_URL + this.endPoint + `/checkAvailability`, data);
	}

}