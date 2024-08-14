import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
  SET_LOCATIONS_SEARCH_DATA,
  SET_SELECTED_PATH_DATA,
  SET_SELECTED_SEARCH_DATA,
  SET_SELECTED_TREE_DATA,
  SET_LOCATIONS_STATE_DATA,
} from "./types";
import { LocationModule } from "../../../Modules/Location";

const locationModule = new LocationModule();

export const getLocationData = (data?: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { locationSearchResp } = getState()["locationReducer"];

    let url = `location`;
    dispatch({
      type: SET_LOCATIONS_SEARCH_DATA,
      payload: { ...locationSearchResp, loading: true },
    });
    try {
      const res = await api.get(url, { params: data });
      dispatch({
        type: SET_LOCATIONS_SEARCH_DATA,
        payload: {
          ...locationSearchResp,
          loading: false,
          data: res?.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: SET_LOCATIONS_SEARCH_DATA,
        payload: { ...locationSearchResp, loading: false, errorData: error },
      });
    }
  };

export const getSelectedLocationData = (data: number, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { selectedSearchData, selectedTreeData, locationSearchResp } =
      getState()["locationReducer"];

    let url = `location/searchLocation/${data}`;
    dispatch({
      type: SET_SELECTED_SEARCH_DATA,
      payload: { ...selectedSearchData, loading: true },
    });
    try {
      const res = await api.get(url);

      if (res?.data?.data?.current?.id) {
        const currentData = res?.data?.data?.current

        // if the current data is not in the locationSearchResp.data, add it
        if (!locationSearchResp?.data?.find((item: any) => item?.id === currentData?.id)) {
          dispatch({
            type: SET_LOCATIONS_SEARCH_DATA,
            payload: {
              ...locationSearchResp,
              data: [...locationSearchResp?.data, currentData]
            }
          })
        }
      }

      dispatch({
        type: SET_SELECTED_SEARCH_DATA,
        payload: {
          ...selectedSearchData,
          loading: false,
          data: res?.data?.data?.current,
        },
      });
      dispatch({
        type: SET_SELECTED_TREE_DATA,
        payload: {
          ...selectedTreeData,
          loading: false,
          data: res?.data?.data?.locationTree,
        },
      });
      dispatch({
        type: SET_SELECTED_PATH_DATA,
        payload: {
          location: res?.data?.data?.current?.id
            ? res?.data?.data?.current?.id
            : "",
          country: res?.data?.data?.selected?.country
            ? res?.data?.data?.selected?.country
            : "",
          stateId: res?.data?.data?.selected?.state
            ? res?.data?.data?.selected?.state
            : "",
          communityId: res?.data?.data?.selected?.community
            ? res?.data?.data?.selected?.community
            : "",
          subCommunityId: res?.data?.data?.selected?.subCommunity
            ? res?.data?.data?.selected?.subCommunity
            : "",
          buildingId: res?.data?.data?.selected?.building
            ? res?.data?.data?.selected?.building
            : "",
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: SET_SELECTED_SEARCH_DATA,
        payload: { ...selectedSearchData, loading: false, errorData: error },
      });
    }
  };

// Get the state location data
export const getStateLocationData = (data?: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { stateLocationResp } = getState()["locationReducer"];

    dispatch({
      type: SET_LOCATIONS_STATE_DATA,
      payload: { ...stateLocationResp, loading: true },
    });

    try {
      locationModule.getAllRecords({ type: "state" }).then((res) => {
        dispatch({
          type: SET_LOCATIONS_STATE_DATA,
          payload: {
            ...stateLocationResp,
            loading: false,
            data: res?.data?.data,
          },
        });

        callback && callback();
      }).catch((error) => {
        dispatch({
          type: SET_LOCATIONS_STATE_DATA,
          payload: { ...stateLocationResp, loading: false, errorData: error },
        });
      });

    } catch (error) {
      dispatch({
        type: SET_LOCATIONS_STATE_DATA,
        payload: { ...stateLocationResp, loading: false, errorData: error },
      });
    }
  };

// set the selected building
export const setSelectedBuilding = (id: number) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { selectedPaths } = getState()["locationReducer"];

    dispatch({
      type: SET_SELECTED_PATH_DATA,
      payload: {
        ...selectedPaths,
        buildingId: id,
      }
    })
  }