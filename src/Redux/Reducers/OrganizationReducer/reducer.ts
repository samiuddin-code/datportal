import { actionType } from "../commonTypes";
import { ADD_ORGANIZATION_DATA, DELETE_ORGANIZATION_DATA, EDIT_ORGANIZATION_DATA, GET_ORGANIZATION_NUMBER, GET_SINGLE_ORGANIZATION_DATA, SET_ORGANIZATION_DATA } from "./types";
const initialState = {
  organizationData: { data: [], loading: false, error: false, errorData: {} },
  addOrganizationData: { data: [], loading: false, error: false, errorData: {} },
  editOrganizationData: { data: [], loading: false, error: false, errorData: {} },
  deleteOrganizationData: { data: [], loading: false, error: false, errorData: {} },
  singleOrganizationData: { data: {}, loading: false, error: false, errorData: {} },
  organizationsNumber: { data: [], loading: false, error: false, errorData: {} },
};
export default function organizationReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_ORGANIZATION_DATA:
      return { ...state, organizationData: action.payload };
    case ADD_ORGANIZATION_DATA:
      return { ...state, addOrganizationData: action.payload };
    case EDIT_ORGANIZATION_DATA:
      return { ...state, editOrganizationData: action.payload };
    case DELETE_ORGANIZATION_DATA:
      return { ...state, deleteOrganizationData: action.payload };
    case GET_SINGLE_ORGANIZATION_DATA:
      return { ...state, singleOrganizationData: action.payload };
    case GET_ORGANIZATION_NUMBER:
      return { ...state, organizationsNumber: action.payload };
    default:
      return state;
  }
}
