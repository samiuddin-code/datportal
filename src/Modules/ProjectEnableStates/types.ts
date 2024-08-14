import { APIResponseObject } from "../Common/common.interface";

export type ProjectEnableStatesType = {
  id: number;
  pId: number;
  pstateId: number;
};

export type ProjectEnableStatesResponseObject = APIResponseObject & { data: ProjectEnableStatesType };
export type ProjectEnableStatesResponseArray = APIResponseObject & {
  data: Array<ProjectEnableStatesType>;
};
