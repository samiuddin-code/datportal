import { actionType } from "../commonTypes";
import { ADD_PACKAGE_DATA, DELETE_PACKAGE_DATA, EDIT_PACKAGE_DATA, GET_SINGLE_PACKAGE_DATA, SET_PACKAGE_DATA } from "./types";
const initialState = {
  packageData: { data: [], loading: false, error: false, errorData: {} },
  addPackageData: { data: [], loading: false, error: false, errorData: {} },
  editPackageData: { data: [], loading: false, error: false, errorData: {} },
  deletePackageData: { data: [], loading: false, error: false, errorData: {} },
  singlePackageData: { data: {}, loading: false, error: false, errorData: {} },
};
export default function packageReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_PACKAGE_DATA:
      return { ...state, packageData: action.payload };
    case ADD_PACKAGE_DATA:
      return { ...state, addPackageData: action.payload };
    case EDIT_PACKAGE_DATA:
      return { ...state, editPackageData: action.payload };
    case DELETE_PACKAGE_DATA:
      return { ...state, deletePackageData: action.payload };
    case GET_SINGLE_PACKAGE_DATA:
      return { ...state, singlePackageData: action.payload };
    default:
      return state;
  }
}
