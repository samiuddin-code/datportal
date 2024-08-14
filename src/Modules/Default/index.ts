import apiInstance from "../../services/axiosInstance";

export class DefaultModule {
    private mail = "mail";
    private systemLogs = "system-logs";

    /** Get Mail Logs */
    getMailLogs = (query?: any) => {
        return apiInstance.get(`${this.mail}/readMailSentLogs`, { params: query });
    }

    /** Get System Logs */
    getSystemLogs = (query?: any) => {
        return apiInstance.get(`${this.systemLogs}/readSystemLogs`, { params: query });
    }
}
