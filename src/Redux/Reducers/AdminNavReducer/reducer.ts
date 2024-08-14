import { actionType } from "../commonTypes";
import { SET_ADMIN_NAV_DATA, adminNavData } from "./types";

const initialState = {
  adminNavData: {
    data: [],
    loading: false,
    error: false,
    errorData: {}
  } as adminNavData,
};
export default function adminNavReducer(state = initialState, action: actionType) {
  switch (action.type) {
    case SET_ADMIN_NAV_DATA:
      return { ...state, adminNavData: action.payload  as adminNavData };
    default:
      return state;
  }
}
