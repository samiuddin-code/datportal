
import api from "../../../services/axiosInstance"
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { ADD_PACKAGE_DATA, DELETE_PACKAGE_DATA, EDIT_PACKAGE_DATA, GET_SINGLE_PACKAGE_DATA, SET_PACKAGE_DATA } from "./types";


export const getPackageData =
  (data?: number, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { packageData, singlePackageData } = getState()["packageReducer"];
      let currentData = data ? singlePackageData : packageData;
      const CURRENT_TYPE = data ? GET_SINGLE_PACKAGE_DATA : SET_PACKAGE_DATA;
      const url = data ? `package/${data}?all=true` : "package";
      dispatch({
        type: CURRENT_TYPE,
        payload: { ...currentData, loading: true },
      });
      try {
        const res = await api.get(url);
        dispatch({
          type: CURRENT_TYPE,
          payload: { ...currentData, loading: false, data: res?.data?.data },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: CURRENT_TYPE,
          payload: { ...currentData, loading: false, errorData: error },
        });
      }
    };
export const deletePackage = (id: number, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { deletePackageData } = getState()["packageReducer"];
    dispatch({
      type: DELETE_PACKAGE_DATA,
      payload: { ...deletePackageData, loading: true },
    });
    try {
      const res = await api.delete(`package/${id}`);
      dispatch({
        type: DELETE_PACKAGE_DATA,
        payload: {
          ...deletePackageData,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: DELETE_PACKAGE_DATA,
        payload: { ...deletePackageData, loading: false, errorData: error },
      });
    }
  };
export const addPackageDataAction =
  (data: any, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { addPackageData } = getState()["packageReducer"];
      dispatch({
        type: ADD_PACKAGE_DATA,
        payload: { ...addPackageData, loading: true },
      });
      try {
        const res = await api.post("package", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        dispatch({
          type: ADD_PACKAGE_DATA,
          payload: { ...addPackageData, loading: false, data: res?.data?.data },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: ADD_PACKAGE_DATA,
          payload: { ...addPackageData, loading: false, errorData: error },
        });
      }
    };
export const editPackageDataAction =
  (data: any, item: any, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { editPackageData } = getState()["packageReducer"];
      dispatch({
        type: EDIT_PACKAGE_DATA,
        payload: { ...editPackageData, loading: true },
      });
      try {
        const res = await api.patch(`package/${item?.id}`, data);
        dispatch({
          type: EDIT_PACKAGE_DATA,
          payload: {
            ...editPackageData,
            loading: false,
            data: res?.data?.data,
          },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: EDIT_PACKAGE_DATA,
          payload: { ...editPackageData, loading: false, errorData: error },
        });
      }
    };