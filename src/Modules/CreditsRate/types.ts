import { APIResponseObject } from "../Common/common.interface";
import { CountryTypes } from "../Country/types";
import { CurrencyTypes } from "../Currency/types";

export type CreditsRate = {
	id: number;
	credits: number;
	countryId: number | null;
	currencyId: number | null;
	currency: CurrencyTypes;
	country: Partial<CountryTypes>;
	rate: number;
	ratePerCredit: number;
	isActive: boolean;
	addedDate: Date;
	addedById: number | null;
};

export type CreditsRateResponseObject = APIResponseObject & { data: CreditsRate };
export type CreditsRateResponseArray = APIResponseObject & { data: Array<CreditsRate> };
