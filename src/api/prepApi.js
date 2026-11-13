import axios from "axios";

const prepApi = axios.create({
    baseURL: "http://localhost:8082",
});

prepApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default prepApi;