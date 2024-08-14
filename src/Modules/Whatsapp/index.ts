import apiInstance from "../../services/axiosInstance";
import { WHATSAPP_QUERY_TYPES } from "./types";

export class WhatsappModule {
	private readonly endPoint = "whatsapp";

	getAllRecords = (query?: Partial<WHATSAPP_QUERY_TYPES>) => {
		return apiInstance.get(this.endPoint, { params: query });
	};
}