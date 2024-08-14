import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export type PublicHolidayType = {
    id: number;
    title: string;
    date: Date;
    AddedBy: UserTypes;
    addedDate: Date | string;
};

export type CreatePublicHolidayType = {
    title: string;
    dates: string[] | Date[];
};

export type PublicHolidayResponseObject = APIResponseObject & { data: PublicHolidayType };
export type PublicHolidayResponseArray = APIResponseObject & {
    data: Array<PublicHolidayType>;
};
