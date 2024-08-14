
import api from "../../../services/axiosInstance"
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { SET_ADMIN_NAV_DATA } from "./types";


export const getAdminNavData =
  (callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { adminNavData } = getState()["adminNavReducer"];
    dispatch({
      type: SET_ADMIN_NAV_DATA,
      payload: { ...adminNavData, loading: true },
    });
    try {
      const res = await api.get("user/user-menu");
      dispatch({
        type: SET_ADMIN_NAV_DATA,
        payload: { ...adminNavData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: SET_ADMIN_NAV_DATA,
        payload: { ...adminNavData, loading: false, errorData: error },
      });
    }
  };
