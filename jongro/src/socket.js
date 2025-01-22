import { io } from "socket.io-client";
let socket;
export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:3001");
  }
  return socket;
}
