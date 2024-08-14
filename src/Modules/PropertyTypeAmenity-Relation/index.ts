import apiInstance from "../../services/axiosInstance";
import { PropertyTypeAmenityRelationType } from "./types";

export class Property_Type_Amenity_Relation_Module {
	private readonly endPoint = "type-amenity-relation";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	createRecord = (data: { propertyTypeId: number, amenityIds: number[] }) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	updateRecord = (data: Partial<PropertyTypeAmenityRelationType>) => {
		return apiInstance.patch(`${this.endPoint}`, data);
	};

	/** delete multiple records */
	deleteMultipleRecords = (propertyTypeId: number, amenityIds: { amenityIds: number[] }) => {
		return apiInstance.delete(`${this.endPoint}/removeMultiple/${propertyTypeId}`, {
			params: amenityIds,
		});
	};
}
