export enum FurnishType {
  "furnished" = "furnished",
  "unfurnished" = "unfurnished",
  "partly-furnished" = "partly-furnished",
}

export enum Bedrooms {
  "Studio" = "studio",
  "_1" = "1",
  "_2" = "2",
  "_3" = "3",
  "_4" = "4",
  "_5" = "5",
  "_6" = "6",
  "_7" = "7",
  "_7+" = "7+",
  "N/A" = "N/A",
}

export enum Bathrooms {
  "None" = "none",
  "_1" = "1",
  "_2" = "2",
  "_3" = "3",
  "_4" = "4",
  "_5" = "5",
  "_6" = "6",
  "_7" = "7",
  "_7+" = "7+",
  "N/A" = "N/A",
}

export enum Parking {
  "none" = "none",
  "_1" = "1",
  "_2" = "2",
  "_3" = "3",
  "_4" = "4",
  "_5" = "5",
  "_6" = "6",
  "_7" = "7",
  "_8" = "8",
  "_9" = "9",
  "_10" = "10",
  "_10+" = "10+",
}

export enum CompletionStatus {
  "completed" = "completed",
  "off-plan" = "off-plan",
}

export enum ChequesCount {
  "1 cheque" = "1",
  "upto 2 cheques" = "2",
  "upto 3 cheques" = "3",
  "upto 4 cheques" = "4",
  "upto 5 cheques" = "5",
  "upto 6 cheques" = "6",
  "upto 12 cheques" = "12",
}

export enum PropertyPriceType {
  "yearly" = "yearly",
  "monthly" = "monthly",
  "weekly" = "weekly",
  "daily" = "daily",
  // "fixed" = "fixed",
}

export type PropertyPriceTypeFields = {
  yearlyPrice?: number;
  monthlyPrice?: number;
  weeklyPrice?: number;
  dailyPrice?: number;
  fixedPrice?: number;
};

export enum PropertyPriceTypeMap {
  "yearly" = "yearlyPrice",
  "monthly" = "monthlyPrice",
  "weekly" = "weeklyPrice",
  "daily" = "dailyPrice",
  "fixed" = "fixedPrice",
}
