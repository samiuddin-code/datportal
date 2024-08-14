import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { GET_UPLOAD_IMAGE_RESP } from "./types";

export const getImageUploadData =
  (imageData: string, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { imageUploadData } = getState()["AddImageReducer"];

    let url = `property/uploadImages`;
    dispatch({
      type: GET_UPLOAD_IMAGE_RESP,
      payload: { ...imageUploadData, loading: true },
    });
    try {
      const res = await api.post(url, imageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch({
        type: GET_UPLOAD_IMAGE_RESP,
        payload: {
          ...imageUploadData,
          loading: false,
          data: res.data?.data,
        },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: GET_UPLOAD_IMAGE_RESP,
        payload: {
          ...imageUploadData,
          loading: false,
          errorData: error,
        },
      });
    }
  };
