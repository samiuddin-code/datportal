import {
  PermitClientStatus, PermitFinanceStatus, TransactionStatus,
  QuotationTypeEnum, SupervisionPaymentSchedule
} from "./commonEnums"

type OptionsFromEnumTypes<TValue = string | number | boolean> = {
  label: string;
  value: TValue;
};

export type EnumObject<T> = Record<string, T>;

/** Used to get options from enum object */
export const getOptionsFromEnum = <T extends EnumObject<unknown>, TValue = string>(
  enumObject: T
): OptionsFromEnumTypes<TValue>[] => {
  const enumEntries = Object.entries(enumObject);
  const options = enumEntries.filter(([key]) => isNaN(Number(key))).map(([key, value]) => ({
    label: key, value: value as TValue
  }));
  return options;
};

/** Finance Status Options */
export const FinanceStatusOptions = getOptionsFromEnum(PermitFinanceStatus)
/** Client Status Options */
export const ClientStatusOptions = getOptionsFromEnum(PermitClientStatus)
/** Government Transaction Status Options */
export const TransactionStatusOptions = getOptionsFromEnum(TransactionStatus)
/** Quotation Type Options */
export const QuotationTypeOptions = getOptionsFromEnum(QuotationTypeEnum)
/** Supervision Payment Schedule Options */
export const PaymentScheduleOptions = getOptionsFromEnum(SupervisionPaymentSchedule)