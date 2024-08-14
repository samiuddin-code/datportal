
import { AuthModule } from "../../../Modules/Auth";
import TokenService from "../../../services/tokenService";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { loginType, REFRESH_TOKEN, SET_LOGIN_DATA } from "./types";

const authModule = new AuthModule();

export const loginApi = (data: loginType, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { loginDetails } = getState()["loginReducer"];
    dispatch({
      type: SET_LOGIN_DATA,
      payload: { ...loginDetails, loading: true },
    });
    try {
      authModule.login(data).then((res) => {
        const data = res.data?.data;
        if (data?.token) {
          TokenService.updateLocalAccessToken(data?.token?.access_token);
          TokenService.updateLocalRefreshToken(data?.token?.refresh_token);
          TokenService.saveUserData(res.data.data?.userData);
        }

        dispatch({
          type: SET_LOGIN_DATA,
          payload: { ...loginDetails, loading: false, data: res.data?.data },
        });

        callback && callback();
      }).catch((err) => {
        dispatch({
          type: SET_LOGIN_DATA,
          payload: { ...loginDetails, loading: false, errorData: err },
        });
      })
    } catch (error) {
      dispatch({
        type: SET_LOGIN_DATA,
        payload: { ...loginDetails, loading: false, errorData: error },
      });
    }
  };

export const refreshToken = (accessToken: string) => (dispatch: dispatchType) => {
  dispatch({
    type: REFRESH_TOKEN,
    payload: accessToken,
  });
};
