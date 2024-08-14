import axios from "axios";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";

export type AuthTypes = {
    password: string;
    newPassword: string;
}

export class AuthModule {
    private readonly endPoint = "auth";

    // change user password
    changePassword = (data: AuthTypes) => {
        return apiInstance.post(`${this.endPoint}/change-user-password`, data);
    }

    // send password reset link to email
    sendPasswordResetLink = (email: string) => {
        return axios.post(`${BASE_URL}${this.endPoint}/send-password-reset-link`, { email });
    }

    // reset user password
    resetPassword = (data: { password: string; resetToken: string; }) => {
        return axios.post(`${BASE_URL}${this.endPoint}/reset-user-password`, data);
    }

    //admin login
    login = (data: { email: string; password: string }) => {
        return axios.post(`${BASE_URL}${this.endPoint}/login`, data);
    }

    /** Login as user
     * @param {number} userId - The id of the user
     */
    loginAsUser = (userId: number) => {
        return apiInstance.post(`${this.endPoint}/loginAsUser`, {
            userId
        });
    }

    //logout
    logout(accessToken: string, refreshToken: string) {
        return axios({
            url: `${BASE_URL}${this.endPoint}/logout`,
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            data: { refreshToken }
        })
    }
}