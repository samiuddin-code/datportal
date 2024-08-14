import { actionType } from "../commonTypes";
import {
  SET_LOCATIONS_SEARCH_DATA, SET_SELECTED_PATH_DATA, SET_SELECTED_SEARCH_DATA,
  SET_SELECTED_TREE_DATA, SET_LOCATIONS_STATE_DATA
} from "./types";
const initialState = {
  locationSearchResp: { data: [], loading: false, error: false, errorData: {} },
  selectedSearchData: { data: [], loading: false, error: false, errorData: {} },
  selectedTreeData: { data: [], loading: false, error: false, errorData: {} },
  selectedPaths: { country: "", stateId: "", communityId: "", subCommunityId: "", buildingId: "" },
  stateLocationResp: { data: [], loading: false, error: false, errorData: {} },
};
export default function locationReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_LOCATIONS_SEARCH_DATA:
      return { ...state, locationSearchResp: action.payload };
    case SET_SELECTED_SEARCH_DATA:
      return { ...state, selectedSearchData: action.payload };
    case SET_SELECTED_TREE_DATA:
      return { ...state, selectedTreeData: action.payload };
    case SET_SELECTED_PATH_DATA:
      return { ...state, selectedPaths: action.payload };
    case SET_LOCATIONS_STATE_DATA:
      return { ...state, stateLocationResp: action.payload };
    default:
      return state;
  }
}
