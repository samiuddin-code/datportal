
import { UserModule } from "../../../Modules/User";
import api from "../../../services/axiosInstance"
import TokenService from "../../../services/tokenService";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { ADD_USERS_DATA, DELETE_USERS_DATA, EDIT_USERS_DATA, GET_LOGGED_IN_USER_DATA, GET_USERS_DATA, GET_USER_PERMISSIONS } from "./types";

const userModule = new UserModule()

export const getUsersData = (data?: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { usersData } = getState()["usersReducer"];
    let url = `user`;

    dispatch({
      type: GET_USERS_DATA,
      payload: { ...usersData, loading: true },
    });

    try {
      const res = await api.get(url, { params: data });
      dispatch({
        type: GET_USERS_DATA,
        payload: { ...usersData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: GET_USERS_DATA,
        payload: { ...usersData, loading: false, errorData: error },
      });
    }
  };

/** Get logged in user profile data with scores  */
export const getLoggedInUser = ({
  reload = false
}) => async (dispatch: dispatchType, getState: () => RootState) => {
  const { loggedInUserData } = getState()["usersReducer"];

  // user data from local storage
  const userData = TokenService.getUserData();

  dispatch({
    type: GET_LOGGED_IN_USER_DATA,
    payload: { ...loggedInUserData, loading: true },
  });

  try {
    if (!userData) {
      userModule.getLoggedInUser().then((res) => {
        const data = res?.data?.data;
        dispatch({
          type: GET_LOGGED_IN_USER_DATA,
          payload: {
            ...loggedInUserData,
            loading: false,
            data: data
          }
        });

        // save user data in local storage
        TokenService.saveUserData(data);
      }).catch((err) => {
        const error = err?.response?.data?.error;
        dispatch({
          type: GET_LOGGED_IN_USER_DATA,
          payload: {
            ...loggedInUserData,
            loading: false,
            errorData: error
          },
        });
      })
    } else {
      if (reload) {
        userModule.getLoggedInUser().then((res) => {
          const data = res?.data?.data;
          dispatch({
            type: GET_LOGGED_IN_USER_DATA,
            payload: {
              ...loggedInUserData,
              loading: false,
              data: data
            }
          });

          // save user data in local storage
          TokenService.saveUserData(data);
        }).catch((err) => {
          const error = err?.response?.data?.error;
          dispatch({
            type: GET_LOGGED_IN_USER_DATA,
            payload: {
              ...loggedInUserData,
              loading: false,
              errorData: error
            },
          });
        })
      } else {
        dispatch({
          type: GET_LOGGED_IN_USER_DATA,
          payload: {
            ...loggedInUserData,
            loading: false,
            data: userData
          }
        });
      }
    }
  } catch (error) {
    dispatch({
      type: GET_LOGGED_IN_USER_DATA,
      payload: {
        ...loggedInUserData,
        loading: false,
        errorData: error
      },
    });
  }
};

/** Get available permissions for the logged in user */
export const getUserPermissions = (data: string[]) => async (dispatch: dispatchType, getState: () => RootState) => {
  const { userPermissions } = getState()["usersReducer"];

  dispatch({
    type: GET_USER_PERMISSIONS,
    payload: { ...userPermissions },
  });

  try {
    userModule.getPermissions({ slugs: data }).then((res) => {
      dispatch({
        type: GET_USER_PERMISSIONS,
        payload: {
          ...userPermissions, ...res?.data?.data
        }
      });
    }).catch((err) => {
      const error = err?.response?.data?.error;
      dispatch({
        type: GET_USER_PERMISSIONS,
        payload: { ...userPermissions, errorData: error },
      });
    })
  }
  catch (error) {
    dispatch({
      type: GET_USER_PERMISSIONS,
      payload: { ...userPermissions, errorData: error },
    });
  }
};

export const deleteUsers = (id: string, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { deleteUsersData } = getState()["usersReducer"];
    dispatch({
      type: DELETE_USERS_DATA,
      payload: { ...deleteUsersData, loading: true },
    });
    try {
      const res = await api.delete(`users/${id}`);
      dispatch({
        type: DELETE_USERS_DATA,
        payload: { ...deleteUsersData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: DELETE_USERS_DATA,
        payload: { ...deleteUsersData, loading: false, errorData: error },
      });
    }
  };

export const addUsersDataAction = (data: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { addUsersData } = getState()["usersReducer"];
    dispatch({
      type: ADD_USERS_DATA,
      payload: { ...addUsersData, loading: true },
    });
    try {
      const res = await api.post("users", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch({
        type: ADD_USERS_DATA,
        payload: { ...addUsersData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: ADD_USERS_DATA,
        payload: { ...addUsersData, loading: false, errorData: error },
      });
    }
  };

export const editUsersDataAction = (data: any, users: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { editUsersData } = getState()["usersReducer"];
    dispatch({
      type: EDIT_USERS_DATA,
      payload: { ...editUsersData, loading: true },
    });
    try {
      const res = await api.patch(`users/${users?.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({
        type: EDIT_USERS_DATA,
        payload: { ...editUsersData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: EDIT_USERS_DATA,
        payload: { ...editUsersData, loading: false, errorData: error },
      });
    }
  };
