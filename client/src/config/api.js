import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

const deleteCookie = (name) => {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
};

api.interceptors.response.use(
    response => response,
    error => {
        const message = error?.response?.data?.error;

        if (message === "Access denied. Your account has been banned.") {
            toast.error(message, { duration: 2000 });

            deleteCookie("acc_token");

            if (window.location.pathname !== "/auth") {
                setTimeout(() => {
                    window.location.href = "/auth";
                }, 1000);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
