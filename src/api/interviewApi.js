import axios from "axios";

const interviewApi = axios.create({
    baseURL: "http://localhost:8081/api",
});

// Attach the same JWT — interview-service will validate it once we wire that in later
interviewApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default interviewApi;