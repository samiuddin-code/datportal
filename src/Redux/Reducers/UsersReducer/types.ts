// action constants

import { UserDashboardPermissionsType } from "@modules/User/permissions";
import { UserTypes } from "../../../Modules/User/types";

export const GET_USERS_DATA = "GET_USERS_DATA";
export const GET_LOGGED_IN_USER_DATA = "GET_LOGGED_IN_USER_DATA";
export const ADD_USERS_DATA = "ADD_USERS_DATA";
export const EDIT_USERS_DATA = "EDIT_USERS_DATA";
export const DELETE_USERS_DATA = "DELETE_USERS_DATA";
export const GET_USER_PERMISSIONS = "GET_USER_PERMISSIONS"
// types
type UsersData = {
    data: UserTypes[]
    loading: boolean;
    error: boolean;
    errorData: any;
};

export type InitialStateTypes = {
    usersData: UsersData;
    loggedInUserData: {
        data: UserTypes
        loading: boolean;
        error: boolean;
        errorData: any
    };
    userPermissions: Partial<UserDashboardPermissionsType>
    addUsersData: UsersData;
    editUsersData: UsersData;
    deleteUsersData: UsersData;
};