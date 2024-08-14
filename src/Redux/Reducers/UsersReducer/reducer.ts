import { UserTypes } from "../../../Modules/User/types";
import { actionType } from "../commonTypes";
import {
  ADD_USERS_DATA, DELETE_USERS_DATA,
  EDIT_USERS_DATA, GET_LOGGED_IN_USER_DATA,
  GET_USERS_DATA, GET_USER_PERMISSIONS, 
  InitialStateTypes
} from "./types";

const initialState: InitialStateTypes = {
  usersData: { data: [], loading: false, error: false, errorData: {} },
  loggedInUserData: { data: {} as UserTypes,
  loading: false, error: false, errorData: {}
 },
  userPermissions: {},
  addUsersData: { data: [], loading: false, error: false, errorData: {} },
  editUsersData: { data: [], loading: false, error: false, errorData: {} },
  deleteUsersData: { data: [], loading: false, error: false, errorData: {} },
};

export default function usersReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case GET_USERS_DATA:
      return { ...state, usersData: action.payload as InitialStateTypes['usersData'] }
    case GET_LOGGED_IN_USER_DATA:
      return { ...state, loggedInUserData: action.payload as InitialStateTypes['loggedInUserData'] }
    case GET_USER_PERMISSIONS:
      return { ...state, userPermissions: action.payload as InitialStateTypes['userPermissions']}
    case ADD_USERS_DATA:
      return { ...state, addUsersData: action.payload };
    case EDIT_USERS_DATA:
      return { ...state, editUsersData: action.payload };
    case DELETE_USERS_DATA:
      return { ...state, deleteUsersData: action.payload };
    default:
      return state;
  }
}
