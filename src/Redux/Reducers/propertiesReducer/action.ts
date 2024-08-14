
import api from "../../../services/axiosInstance"
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { ADD_PROPERTIES_DATA, DELETE_PROPERTIES_DATA, EDIT_PROPERTIES_DATA, GET_PROPERTIES_NUMBER, GET_PROPERTY_DATA_BY_ID, SET_PROPERTIES_DATA } from "./types";
import { PropertiesModule } from "../../../Modules/Properties";
import { errorHandler } from "../../../helpers";
import moment from "moment";

const propertiesModule = new PropertiesModule()

export const getPropertiesData = (queryData?: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { propertiesData, propertiesNumber } = getState()["propertiesReducer"];

    dispatch({
      type: SET_PROPERTIES_DATA,
      payload: { ...propertiesData, loading: true },
    });

    let url = `property`;

    // remove queries with empty values from query
    if (queryData) {
      Object.keys(queryData).forEach((key) => {
        if (queryData[key] === "" || queryData[key]?.length === 0) {
          delete queryData[key];
        }
      });
    }

    try {
      let _filters = { ...queryData }
      if (_filters.fromDate) {
        _filters.fromDate = moment(_filters?.fromDate).format('YYYY-MM-DD')
      }

      if (_filters.toDate) {
        _filters.toDate = moment(_filters?.toDate).format('YYYY-MM-DD')
      }

      const res = await api.get(url, { params: _filters });

      dispatch({
        type: SET_PROPERTIES_DATA,
        payload: { ...propertiesData, loading: false, data: res?.data?.data },
      });

      dispatch({
        type: GET_PROPERTIES_NUMBER,
        payload: { ...propertiesNumber, loading: false, data: res?.data?.meta },
      });

      callback && callback();
    } catch (error) {
      dispatch({
        type: SET_PROPERTIES_DATA,
        payload: { ...propertiesData, loading: false, errorData: error },
      });
    }
  };

export const getPropertyDataById = (id: string, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { propertyDataById } = getState()["propertiesReducer"];
    dispatch({
      type: GET_PROPERTY_DATA_BY_ID,
      payload: { ...propertyDataById, loading: true },
    });
    try {
      const res = await api.get(`property/findOneById/${id}`);
      dispatch({
        type: GET_PROPERTY_DATA_BY_ID,
        payload: { ...propertyDataById, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: GET_PROPERTY_DATA_BY_ID,
        payload: { ...propertyDataById, loading: false, errorData: error },
      });
    }
  };

export const deleteProperties = (id: any, callback?: () => void | Promise<void>) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { deletePropertiesData } = getState()["propertiesReducer"];
    dispatch({
      type: DELETE_PROPERTIES_DATA,
      payload: { ...deletePropertiesData, loading: true },
    });
    try {
      const res = await api.delete(`property/${id}`);
      dispatch({
        type: DELETE_PROPERTIES_DATA,
        payload: {
          ...deletePropertiesData,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: DELETE_PROPERTIES_DATA,
        payload: { ...deletePropertiesData, loading: false, errorData: error },
      });
    }
  };

export const addPropertiesDataAction = (data: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { addPropertiesData } = getState()["propertiesReducer"];
    dispatch({
      type: ADD_PROPERTIES_DATA,
      payload: { ...addPropertiesData, loading: true },
    });
    try {
      const res = await api.post("property", data);
      dispatch({
        type: ADD_PROPERTIES_DATA,
        payload: {
          ...addPropertiesData,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      let errorData = errorHandler(error);
      dispatch({
        type: ADD_PROPERTIES_DATA,
        payload: { ...addPropertiesData, loading: false, errorData: errorData },
      });
    }
  };

export const editPropertiesDataAction = (data: any, id: number, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { editPropertiesData } = getState()["propertiesReducer"];

    dispatch({
      type: EDIT_PROPERTIES_DATA,
      payload: { ...editPropertiesData, loading: true },
    });

    try {
      propertiesModule.updateRecord(data, id).then((res) => {
        dispatch({
          type: EDIT_PROPERTIES_DATA,
          payload: {
            ...editPropertiesData,
            loading: false,
            data: res?.data?.data,
          },
        });

        callback && callback();
      }).catch((err) => {
        let errorData = errorHandler(err);
        dispatch({
          type: EDIT_PROPERTIES_DATA,
          payload: { ...editPropertiesData, loading: false, errorData: errorData },
        });
      })
    } catch (error) {
      let errorData = errorHandler(error);
      dispatch({
        type: EDIT_PROPERTIES_DATA,
        payload: { ...editPropertiesData, loading: false, errorData: errorData },
      });
    }
  };