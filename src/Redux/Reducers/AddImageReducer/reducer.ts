import { actionType } from "../commonTypes";
import { GET_UPLOAD_IMAGE_RESP} from "./types";
const initialState = {
  imageUploadData: {
    data: [],
    loading: false,
    error: false,
    errorData: {},
  },
};
export default function AddImageReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case GET_UPLOAD_IMAGE_RESP:
      return { ...state, imageUploadData: action.payload };
    default:
      return state;
  }
}
