import React, { useState } from "react";
import "./styles/Auth.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { site } from "../../config.js";
import { useEffect } from "react";


function Auth(props) {
    const [isErrorShowed, setIsErrorShowed] = useState(false);
    const [botValue, setBotValue] = useState();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [redirectToPanel, setRedirectToPanel] = useState(false);
    const [tokenValue, setTokenValue] = useState("");
    const [redirectParams, setRedirectParams] = useState("");
    const [redirectUrl, setRedirectUrl] = useState("");
    const [isLoaded, setIsLoaded] = useState();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setBotValue(searchParams.get("bot"));
        if (botValue) {
            setTokenValue(`_${botValue}`);
            setRedirectParams(`?bot=${botValue}`);
            setRedirectUrl(`/${botValue}`);
        }
        setIsLoaded(true);

    }, [botValue]);

    if (isLoaded == true) {
        const handleLoginChange = (e) => {
            setLogin(e.target.value);
        };

        const handlePasswordChange = (e) => {
            setPassword(e.target.value);
        };

        const handleAuthSubmit = () => {
            if (!login || !password) {
                setIsErrorShowed(true);
                document.getElementById("AuthErrorMessage").innerText = "Заполните поля";
            } else {
                axios
                    .post(`${site}${redirectUrl}/authorization`, {
                        username: login,
                        password: password,
                    })
                    .then((response) => {
                        const statusCode = response.status;
                        if (statusCode === 200) {
                            setIsErrorShowed(false);
                            setAccessToken(response.data.access_token);
                            setRefreshToken(response.data.refresh_token);
                            localStorage.setItem(`accessToken${tokenValue}`, response.data.access_token);
                            localStorage.setItem(`refreshToken${tokenValue}`, response.data.refresh_token);
                            localStorage.setItem("login", login);
                            setRedirectToPanel(true);
                        }
                    })
                    .catch((error) => {
                        setIsErrorShowed(true);
                        if (error.response && error.response.status === 404) {
                            document.getElementById("AuthErrorMessage").innerText =
                                "Неправильный логин или пароль";
                        } else {
                            document.getElementById("AuthErrorMessage").innerText =
                                "Произошла ошибка";
                        }
                    });
            }
        };

        if (redirectToPanel) {
            return <Navigate to={`/panel${redirectParams}`} />;
        }

        return (
            <div className="Auth">
                <h1 className="AuthLogo">Войдите в свой аккаунт</h1>
                <div className="AuthCard">
                    <div className="AuthForm">
                        <div className="AuthFieldContainer">
                            <input
                                id="AuthLogin"
                                className="AuthField"
                                type="text"
                                placeholder=" "
                                value={login}
                                onChange={handleLoginChange}
                            />
                            <label className="AuthPlaceholder" htmlFor="AuthLogin">Логин или E-mail</label>
                        </div>
                        <div className="AuthFieldContainer">
                            <input
                                id="AuthPassword"
                                className="AuthField"
                                type="password"
                                placeholder=" "
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <p className="AuthPlaceholder" htmlFor="AuthPassword">Пароль</p>
                        </div>
                        <div className="AuthError">
                            <div className="AuthErrorField">
                                <i
                                    className={
                                        isErrorShowed
                                            ? "bi bi-exclamation-circle active"
                                            : "bi bi-exclamation-circle"
                                    }
                                ></i>
                                <h1 id="AuthErrorMessage" className={isErrorShowed ? "active" : ""}>
                                    Некорректные данные
                                </h1>
                            </div>
                        </div>
                        <button id="AuthButton" onClick={handleAuthSubmit}>
                            Войти
                        </button>
                    </div>
                </div>
            </div>

        );
    }
}

export { Auth };
