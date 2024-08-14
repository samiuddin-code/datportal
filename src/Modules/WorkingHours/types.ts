import { APIResponseObject } from "../Common/common.interface";

export type WorkingHourType = {
    id: number;
    title: string;
    hours: OpeningHours[]
    addedDate: Date | string;
};

export type OpeningHours = {
    name: string
    day: number
    open : string
    close: string
    closed: boolean
    totalHours?: number
}
export type CreateUpdateWorkingHourType = {
    title: string;
    hours: OpeningHours[]
};

export type WorkingHourResponseObject = APIResponseObject & { data: WorkingHourType };
export type WorkingHourResponseArray = APIResponseObject & {
    data: Array<Partial<WorkingHourType>>;
};
