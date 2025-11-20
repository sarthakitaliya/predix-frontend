import { getAccessToken, useIdentityToken } from "@privy-io/react-auth";
import axios from "axios";

const accessToken = await getAccessToken();
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3030",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
