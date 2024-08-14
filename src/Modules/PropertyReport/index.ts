import apiInstance from "../../services/axiosInstance";
import { PropertyReportFiltersTypes, PropertyReportTypes } from "./types";

export class PropertyReportModule {
	private readonly endPoint = "property-report";

	getAllRecords = (
		query?: Partial<PropertyReportFiltersTypes> & {
			page?: number;
			perPage?: number;
		}
	) => {
		return apiInstance.get(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: PropertyReportTypes) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<PropertyReportTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};

	/** Request for modification */
	requestForModification = (
		id: number,
		data: { status: number; reason: string }
	) => {
		return apiInstance.patch(
			`${this.endPoint}/requestModification/${id}`,
			data
		);
	};

	/** approve or reject modification request */
	approveOrRejectModification = (
		id: number,
		data: { status: number; reason: string }
	) => {
		return apiInstance.patch(
			`${this.endPoint}/approveRejectModificationRequest/${id}`,
			data
		);
	};
}
