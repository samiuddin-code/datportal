import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export interface FeedbackType {
    id: number
    type: number
    url: string
    rating: number
    comment: string
    addedById: number
    addedDate: Date
    AddedBy: UserTypes
}


export type FeedbackResponseObject = APIResponseObject & { data: FeedbackType };
export type FeedbackResponseArray = APIResponseObject & {
    data: Array<FeedbackType>;
};
