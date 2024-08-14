import apiInstance from "../../services/axiosInstance";

export class SiteMapModule {
    private endpoint = "resources"

    getAllRecords = () => {
        return apiInstance.get(`${this.endpoint}/read-sitemap`);
    };

    updateRecord = (data: any) => {
        return apiInstance(
            {
                url: `${this.endpoint}/update-sitemap`,
                method: "PATCH",
                data: data,
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
    };
}
