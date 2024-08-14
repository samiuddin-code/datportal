import { actionType } from "../commonTypes";
import { ADD_ROLE_DATA, DELETE_ROLE_DATA, EDIT_ROLE_DATA, SET_ROLE_DATA } from "./types";
const initialState = {
  roleData: { data: [], loading: false, error: false, errorData: {} },
  addRoleData: { data: [], loading: false, error: false, errorData: {} },
  editRoleData: { data: [], loading: false, error: false, errorData: {} },
  deleteRoleData: { data: [], loading: false, error: false, errorData: {} },
};
export default function roleReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_ROLE_DATA:
      return { ...state, roleData: action.payload };
    case ADD_ROLE_DATA:
      return { ...state, addRoleData: action.payload };
    case EDIT_ROLE_DATA:
      return { ...state, editRoleData: action.payload };
    case DELETE_ROLE_DATA:
      return { ...state, deleteRoleData: action.payload };
    default:
      return state;
  }
}
