import { CompanyAssetTypeEnum } from "@helpers/commonEnums";
import { APIResponseObject } from "@modules/Common/common.interface";

export interface CompanyAssetType {
    id: number;
    code: string;
    type: CompanyAssetTypeEnum;
    assetName: string;
    assetDetail: string;
    quantity: number;
    branchId: null;
    addedDate: Date;
    isPublished: boolean;
    isDeleted: boolean;
}
export interface CompanyAssetParams {
    code: string;
    assetName: string;
    assetDetail: string;
    page: number;
    perPage: number;
    type: 1 | 2 | 3 | 4 | 5;
}

export type CompanyAssetResponseObject = APIResponseObject & { data: CompanyAssetType };
export type CompanyAssetResponseArray = APIResponseObject & {
    data: Array<CompanyAssetType>;
};
