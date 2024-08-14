import apiInstance from "../../services/axiosInstance";
import { PropertyPriceType_Types } from "./types";

export class PropertyPriceTypeModule {
	private readonly endPoint = "property-price-type";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: PropertyPriceType_Types) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<PropertyPriceType_Types>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}
