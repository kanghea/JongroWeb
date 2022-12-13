import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: "http://162.248.101.98:3001"
})