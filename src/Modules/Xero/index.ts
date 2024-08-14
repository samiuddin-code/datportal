import apiInstance from "@services/axiosInstance";
import { XeroGetQuotesType } from "./types";
import { QuotationTypes } from "@modules/Quotation/types";

export class XeroModule {
  private readonly endPoint = "xero";

  getConsentUrl() {
    return apiInstance.get<{ data: { consentUrl: string } }>(`${this.endPoint}/getConsentUrl`);
  }

  authenticate(callbackUrl: string) {
    return apiInstance.post(`${this.endPoint}/authenticate`, { callbackUrl: callbackUrl });
  }

  getQuotes = (data: Partial<XeroGetQuotesType>) => {
    return apiInstance.post<{ data: QuotationTypes }>(`${this.endPoint}/getQuotes`, data);
  }

  checkLoginStatus = () => {
    return apiInstance.post<{ data: boolean }>(`${this.endPoint}/checkLoginStatus`);
  }

  syncAccounts = () => {
    return apiInstance.patch(`${this.endPoint}/syncAccounts`);
  }

  syncProducts = () => {
    return apiInstance.patch(`${this.endPoint}/syncProducts`);
  }

  syncTaxRates = () => {
    return apiInstance.patch(`${this.endPoint}/syncTaxRates`);
  }
}