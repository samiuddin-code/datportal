import { actionType } from "../commonTypes";
import { SET_LOGIN_DATA, REFRESH_TOKEN } from "./types";

const user = JSON.parse(localStorage.getItem("user")||"{}");
const initialState = user
  ? {
      isLoggedIn: true,
      user,
      loginDetails: { data: {}, loading: false, error: false, errorData: {} },
    }
  : {
      isLoggedIn: false,
      user: null,
      loginDetails: { data: {}, loading: false, error: false, errorData: {} },
    };
export default function loginReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_LOGIN_DATA:
      return { ...state, loginDetails: action.payload };
    case REFRESH_TOKEN:
      return {
        ...state,
        user: { ...user, accessToken: action.payload },
      };
    default:
      return state;
  }
}
