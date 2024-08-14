import { BASE_URL } from "@services/axiosInstance";
import TokenService from "@services/tokenService";
import { Socket, io } from "socket.io-client";

let socketConnection: Socket | null = null;

/** This function will return the socket connection instance */
export const getWebSocket = () => {
  if(socketConnection && socketConnection.connected === false){
    socketConnection = null;
  }

  if (!socketConnection) {
    const access_token = TokenService.getLocalAccessToken();
    const socket = io(BASE_URL, {
      extraHeaders: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    socketConnection = socket;
  }

  return socketConnection;
}

export const disConnectWebSocket = () => {
  if (socketConnection) {
    socketConnection.disconnect();
    socketConnection = null;
  }
}