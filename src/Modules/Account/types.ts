import { APIResponseObject } from "@modules/Common/common.interface";

export interface AccountType {
	id:                  number;
    accountCode:         string;
    xeroReference:       string;
    title:               string;
    xeroType:            string;
    description:         null | string;
    bankAccountNumber:   null | string;
    showInExpenseClaims: boolean;
}

export type AccountResponseObject = APIResponseObject & { data: AccountType };
export type AccountResponseArray = APIResponseObject & {
	data: Array<AccountType>;
};
