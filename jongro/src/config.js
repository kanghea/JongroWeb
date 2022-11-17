import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: "https://jongro.herokuapp.com/api/"
})