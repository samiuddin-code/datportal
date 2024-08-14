import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { TransactionsType, TransactionQueryType } from "./types";
import { FormDataHeader } from "@modules/Common/config";

export class TransactionsModule {
  private readonly endPoint = "transactions";

  getAllRecords = <Type extends GetResponseTypes<TransactionsType[], TransactionQueryType>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
  };

  getRecordById = (id: number) => {
    return apiInstance.get(`${this.endPoint}/${id}`);
  };

  deleteRecord = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/${id}`);
  };

  createRecord = (data: FormData | Partial<TransactionsType>) => {
    return apiInstance.post(this.endPoint, data, { headers: FormDataHeader });
  };

  updateRecord = (data: FormData | Partial<TransactionsType>, id: number) => {
    return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
  };

  assignTransaction = (data: { assignedToId: number }, id: number,) => {
    return apiInstance.patch(`${this.endPoint}/assignTransaction/${id}`, data);
  }
}