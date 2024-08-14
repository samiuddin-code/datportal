
import api from "../../../services/axiosInstance"
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { ADD_ROLE_DATA, DELETE_ROLE_DATA, EDIT_ROLE_DATA, SET_ROLE_DATA } from "./types";


export const getRoleData =
  (callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { roleData } = getState()["roleReducer"];
    dispatch({
      type: SET_ROLE_DATA,
      payload: { ...roleData, loading: true },
    });
    try {
      const res = await api.get("role");
      dispatch({
        type: SET_ROLE_DATA,
        payload: { ...roleData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: SET_ROLE_DATA,
        payload: { ...roleData, loading: false, errorData: error },
      });
    }
  };
export const deleteRole =
  (id: string, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { deleteRoleData } = getState()["roleReducer"];
    dispatch({
      type: DELETE_ROLE_DATA,
      payload: { ...deleteRoleData, loading: true },
    });
    try {
      const res = await api.delete(`role/${id}`);
      dispatch({
        type: DELETE_ROLE_DATA,
        payload: { ...deleteRoleData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: DELETE_ROLE_DATA,
        payload: { ...deleteRoleData, loading: false, errorData: error },
      });
    }
  };
export const addRoleDataAction =
  (data: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { addRoleData } = getState()["roleReducer"];
    dispatch({
      type: ADD_ROLE_DATA,
      payload: { ...addRoleData, loading: true },
    });
    try {
      const res = await api.post("role", data);
      dispatch({
        type: ADD_ROLE_DATA,
        payload: { ...addRoleData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: ADD_ROLE_DATA,
        payload: { ...addRoleData, loading: false, errorData: error },
      });
    }
  };
  export const editRoleDataAction =
    (data: any, role: any, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { editRoleData } = getState()["roleReducer"];
      dispatch({
        type: EDIT_ROLE_DATA,
        payload: { ...editRoleData, loading: true },
      });
      try {
        const res = await api.patch(`role/${role?.id}`, data);
        dispatch({
          type: EDIT_ROLE_DATA,
          payload: { ...editRoleData, loading: false, data: res?.data?.data },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: EDIT_ROLE_DATA,
          payload: { ...editRoleData, loading: false, errorData: error },
        });
      }
    };