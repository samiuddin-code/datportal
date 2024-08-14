
import { convertDate } from "../../../helpers/dateHandler";
import api from "../../../services/axiosInstance"
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { ADD_ORGANIZATION_DATA, DELETE_ORGANIZATION_DATA, EDIT_ORGANIZATION_DATA, GET_ORGANIZATION_NUMBER, GET_SINGLE_ORGANIZATION_DATA, SET_ORGANIZATION_DATA } from "./types";

export const getOrganizationFilteredData =
  (data?: any, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { organizationData, organizationsNumber } =
        getState()["organizationReducer"];
      dispatch({
        type: SET_ORGANIZATION_DATA,
        payload: { ...organizationData, loading: true },
      });
      let url = `organization?`;
      if (data) {
        const fromDate = data.fromDate
          ? convertDate(data.fromDate, "yy-mm-dd")
          : "";
        const toDate = data.toDate ? convertDate(data.toDate, "yy-mm-dd") : "";
        const dataAfter = { ...data, fromDate, toDate };
        Object.keys(dataAfter).forEach((item) => {
          if (dataAfter[item].length) {
            if (typeof dataAfter[item] === "string") {
              url = url + `&${item}=${dataAfter[item]}`;
            } else {
              dataAfter[item].forEach((value: any) => {
                url = url + `&${item}[]=${value}`;
              });
            }
          }
        });
      }
      url = data?.page ? url : url + "&page=1";
      url = data?.perPage ? url : url + "&perPage=10";
      try {
        const res = await api.get(url);
        dispatch({
          type: SET_ORGANIZATION_DATA,
          payload: { ...organizationData, loading: false, data: res?.data?.data },
        });
        dispatch({
          type: GET_ORGANIZATION_NUMBER,
          payload: {
            ...organizationsNumber,
            loading: false,
            data: res?.data?.meta,
          },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: SET_ORGANIZATION_DATA,
          payload: { ...organizationData, loading: false, errorData: error },
        });
      }
    };

export const getOrganizationData = (data?: number, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { organizationData, singleOrganizationData } =
      getState()["organizationReducer"];
    let currentData = data ? singleOrganizationData : organizationData;
    const CURRENT_TYPE = data
      ? GET_SINGLE_ORGANIZATION_DATA
      : SET_ORGANIZATION_DATA;
    const url = data ? `organization/${data}?all=true` : "organization";
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

export const deleteOrganization = (id: string, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { deleteOrganizationData } = getState()["organizationReducer"];
    dispatch({
      type: DELETE_ORGANIZATION_DATA,
      payload: { ...deleteOrganizationData, loading: true },
    });
    try {
      const res = await api.delete(`organization/${id}`);
      dispatch({
        type: DELETE_ORGANIZATION_DATA,
        payload: {
          ...deleteOrganizationData,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: DELETE_ORGANIZATION_DATA,
        payload: {
          ...deleteOrganizationData,
          loading: false,
          errorData: error,
        },
      });
    }
  };

export const addOrganizationDataAction = (data: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { addOrganizationData } = getState()["organizationReducer"];
    dispatch({
      type: ADD_ORGANIZATION_DATA,
      payload: { ...addOrganizationData, loading: true },
    });
    try {
      const res = await api.post("organization", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch({
        type: ADD_ORGANIZATION_DATA,
        payload: {
          ...addOrganizationData,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: ADD_ORGANIZATION_DATA,
        payload: { ...addOrganizationData, loading: false, errorData: error },
      });
    }
  };
export const editOrganizationDataAction = (data: any, item: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { editOrganizationData } = getState()["organizationReducer"];
    dispatch({
      type: EDIT_ORGANIZATION_DATA,
      payload: { ...editOrganizationData, loading: true },
    });
    try {
      const res = await api.patch(`organization/${item?.id}`, data);
      dispatch({
        type: EDIT_ORGANIZATION_DATA,
        payload: {
          ...editOrganizationData,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: EDIT_ORGANIZATION_DATA,
        payload: {
          ...editOrganizationData,
          loading: false,
          errorData: error,
        },
      });
    }
  };