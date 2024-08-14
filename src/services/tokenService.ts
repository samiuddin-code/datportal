import { AuthModule } from "../Modules/Auth";
import { UserTypes } from "../Modules/User/types";

class TokenServices {
  public isResourceBusy: boolean;
  constructor() {
    this.isResourceBusy = false;
  }

  /**
   * This function is used to get refresh token from local storage
   * @returns refresh token from local storage
   */
  getLocalRefreshToken() {
    if (typeof localStorage == "undefined") return "";
    const refreshToken = localStorage.getItem("refresh_token");
    return refreshToken;
  };

  /**
   * this function is used to get temporary refresh token from local storage
   */
  getTempRefreshToken() {
    if (typeof localStorage == "undefined") return "";
    const refreshToken = localStorage.getItem("temp_refresh_token");
    return refreshToken;
  };

  /**
   * This function is used to get access token from local storage
   * @returns access token from local storage
   */
  getLocalAccessToken() {
    if (typeof localStorage == "undefined") return "";
    const accessToken = localStorage.getItem("access_token");
    return accessToken;
  };

  /**
   * This function is used to get temporary access token from local storage
   * @returns temporary access token from local storage
   */
  getTempAccessToken() {
    if (typeof localStorage == "undefined") return "";
    const accessToken = localStorage.getItem("temp_access_token");
    return accessToken;
  };

  /**
   * This function is used to update access token in local storage
   * @param token - access token
   */
  updateLocalAccessToken(token: string) {
    if (typeof localStorage == "undefined") return "";
    localStorage.setItem("access_token", token);
  };

  /**
   * This function is used to update temporary access token in local storage
   * @param token - temporary access token
   */
  updateTempAccessToken(token: string) {
    if (typeof localStorage == "undefined") return "";
    localStorage.setItem("temp_access_token", token);
  };

  /**
   * This function is used to update refresh token in local storage
   * @param token - refresh token
   */
  updateLocalRefreshToken(token: string) {
    if (typeof localStorage == "undefined") return "";
    localStorage.setItem("refresh_token", token);
  };

  /**
   * This function is used to update temporary refresh token in local storage
   * @param token - temporary refresh token
   * */
  updateTempRefreshToken(token: string) {
    if (typeof localStorage == "undefined") return "";
    localStorage.setItem("temp_refresh_token", token);
  };

  /**
   * This function is used to logout user and remove tokens and user data from local storage
   * @param shouldHandleRedirection -  if true then it will redirect to login page
   * @returns void
   * */
  removeTokens(shouldHandleRedirection: boolean = true) {
    if (typeof localStorage == "undefined") return "";
    const refreshToken = localStorage.getItem('refresh_token');
    const access_token = localStorage.getItem("access_token") as string;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("temp_access_token");
    localStorage.removeItem("temp_refresh_token");
    localStorage.removeItem("temp_user");
    const auth = new AuthModule();
    if (!refreshToken || !access_token) return window.location.href = "/login";
    auth.logout(access_token, refreshToken)
      .then(res => {
        if (shouldHandleRedirection)
          window.location.href = "/login";
      }).catch(err => {
        if (shouldHandleRedirection)
          window.location.href = "/login";
      })
  }

  /**
   * This function is used to get user data from local storage
   * @returns user data from local storage
   */
  getUserData(): UserTypes {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  /**
   * This function is used to get temporary user data from local storage
   * @returns temporary user data from local storage
   */
  getTempUserData() {
    const userData = localStorage.getItem("temp_user");
    return userData ? JSON.parse(userData) : null;
  };

  /**
   * This function is used to save user data in local storage
   * @param data - user data
   */
  saveUserData(data: any) {
    localStorage.setItem("user", JSON.stringify(data));
  };

  /**
   * This function is used to save temporary user data in local storage
   * @param data - user data
   */
  saveTempUserData(data: any) {
    localStorage.setItem("temp_user", JSON.stringify(data));
  }
}

const TokenService = new TokenServices();
export default TokenService;