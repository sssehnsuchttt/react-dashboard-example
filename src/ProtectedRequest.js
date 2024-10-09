import axios from "axios";
import { site } from "./config.js";
import { auth_path } from "./config.js";
import { Navigate, redirect } from "react-router-dom";


class RequestHandler {
    constructor(url, bot = "", accessToken = null, initData = null) {
        this.url = url;
        this.bot = bot;
        this.bot_url = ""
        this.bot_underscore = ""
        this.redirect_path = `${auth_path}`;
        this.initData = initData;
        if (this.bot != "") {
            this.bot_url = `/${this.bot}`
            this.bot_underscore = `_${this.bot}`
            this.redirect_path = `${auth_path}?bot=${this.bot}`
        }

        this.accessToken = localStorage.getItem(`accessToken${this.bot_underscore}`);

        if (accessToken)
            this.accessToken = accessToken

        
        this.refreshToken = localStorage.getItem(`refreshToken${this.bot_underscore}`);
    }

    async request(method, endpoint, data = null) {


        try {
            const config = {
                method,
                url: `${this.url}${this.bot_url}${endpoint}`,
                headers: {
                    Authorization: this.accessToken,
                    InitData: this.initData,
                },
            };

            if (method === "post" || method === "put" || method === "patch") {
                config.data = data;
            }

            const response = await axios(config);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newAccessToken = await this.handleTokenRefresh();
                    localStorage.setItem(`accessToken${this.bot_underscore}`, newAccessToken);
                    // Повторно вызываем функцию request
                    return await this.request(method, endpoint, data);
                } catch (error) {
                    throw new Error(`Ошибка при обновлении токена ${error}`);
                }
            } else if (error.response && error.response.status === 401) {
                localStorage.removeItem(`accessToken${this.bot_underscore}`);
                localStorage.removeItem(`refreshToken${this.bot_underscore}`);
                localStorage.removeItem("login");

                window.location.href = this.redirect_path;
            } else {
                throw new Error(`Ошибка при выполнении запроса: ${error}`);
            }
        }
    }

    async handleTokenRefresh() {
        try {
            const refreshResponse = await axios.post(`${this.url}${this.bot_url}/refresh_token`, {
                "refresh_token": this.refreshToken,
            });
            this.accessToken = refreshResponse.data.access_token;
            return this.accessToken;
        } catch (refreshError) {
            if (refreshError.response.status === 401) { //такой ошибкой отвечает сервер в случае неправильного refresh токена
                localStorage.removeItem(`accessToken${this.bot_underscore}`);
                localStorage.removeItem(`refreshToken${this.bot_underscore}`);
                localStorage.removeItem("login");
                window.location.href = this.redirect_path;
            }
        }
    }


}


export default RequestHandler;