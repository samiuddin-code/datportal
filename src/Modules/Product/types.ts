import { AccountType } from "@modules/Account/types";
import { TaxRateType } from "@modules/TaxRate/types";

export type ProductType = {
    id: number,
    xeroReference: string,
    productCode: string,
    title: string,
    description: string,
    quantity: number,
    unitPrice: number,
    accountId: number,
    taxRateId: number
    Account: AccountType
    TaxRate: TaxRateType
};