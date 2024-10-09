import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/Home.css";
import { site } from "../../../config.js";
import RequestHandler from "../../../ProtectedRequest.js"
import { NotificationProvider, useNotification } from "../../elements/Notification.js";
import { AlertProvider, useAlert } from "../../elements/Alert"
import { BarComponent, DoughnutComponent } from "../../elements/Charts";

function Home(props) {
    const botRequest = new RequestHandler(site, props.bot);
    const [botInfo, setBotInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorToken, setErrorToken] = useState(false);
    const [errorAdminId, setErrorAdminId] = useState(false);
    const [errorSupportLink, setErrorSupportLink] = useState(false);
    const [errorWebsiteLink, setErrorWebsiteLink] = useState(false);
    const [dataTraffic, setDataTraffic] = useState(null);
    const [dataProfit, setDataProfit] = useState(null);
    const [dataTrafficMonth, setDataTrafficMonth] = useState(null);
    const [dataProfitMonth, setDataProfitMonth] = useState(null);
    const [dataTrafficGeneral, setDataTrafficGeneral] = useState(null);
    const [dataProfitGeneral, setDataProfitGeneral] = useState(null);
    const [dataUsers, setDataUsers] = useState(null);
    const alert = useAlert();
    const notification = useNotification();

    const validateInput = (value, regexPattern) => {
        if (value.length == 0) {
            return {
                isValid: false,
                error: `Пустая строка`,
            };
        }

        if (regexPattern && !regexPattern.test(value)) {
            return {
                isValid: false,
                error: "Неверный формат",
            };
        }

        return {
            isValid: true,
            error: "",
        };
    };

    const handleTokenChange = (setError, regex) => (event) => {
        const value = event.target.value;
        const checkInput = validateInput(value, regex);
        setError(!checkInput.isValid)
    };


    const handleAcceptButton = () => {
        if (!errorAdminId && !errorSupportLink && !errorToken && !errorWebsiteLink) {
            alert.show(
                "Применить изменения",
                "Вы действительно хотите обновить настройки?",
                "Сохранить",
                "Отменить",
                handleAccept
              );
        }
        else {
            notification.show("Ошибка ввода", "Пожалуйста, проверьте правильность введённых данных и повторите попытку", "uil uil-exclamation-octagon", "red");
        }
    };

    const handleAccept = async () => {
        const token = document.getElementById("token").value;
        const admin_id = document.getElementById("admin_id").value;
        const support = document.getElementById("support_link").value;
        const website = document.getElementById("website_link").value;
        setIsLoading(true);
        try {
            const response = await botRequest.request("post", "/update", {
                "token": token,
                "admin_id": admin_id,
                "support": support,
                "website": website
            });
            if (response.status === 200) {
                try {
                    await botRequest.request("post", "/settings", { action: "reload" });
                }
                catch {

                }
                let infoResponse = null;
                while (!infoResponse) {
                    try {
                        const infoResponse = await botRequest.request("get", "/info");
                        setIsLoading(false);
                        setBotInfo(infoResponse.data);
                        notification.show("Успешное обновление", "Настройки бота успешно обновлены и применены", "uil uil-check-circle", "green");
                        break;
                    } catch (error) {
                        console.log("Ожидаем ответа");
                    }
                }
            }
        } catch (error) {
            console.log("Ошибка при отправке данных на сервер:", error);
        }
    };

    const handleDeclineButton = async () => {
        const response = await botRequest.request("get", "/info");
        console.log(response.data)
        setBotInfo(response.data);
        notification.show("Изменения отменены", "Все внесённые изменения были отменены", "uil uil-cancel", "red");
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await botRequest.request("get", "/info");
                setBotInfo(response.data);
                const responseStat = await botRequest.request("get", "/statistics");
                setDataProfit(responseStat.data.profit);
                setDataProfitMonth(responseStat.data.profit_month);
                setDataProfitGeneral(responseStat.data.profit_general);
                setDataTraffic(responseStat.data.traffic);
                setDataTrafficMonth(responseStat.data.traffic_month);
                setDataTrafficGeneral(responseStat.data.traffic_general);
                if (responseStat.data.users.length !== 0)
                {
                    setDataUsers(responseStat.data.users);
                }
                
                
            } catch (error) {
                console.log("Ошибка при получении данных:", error);
            } finally {
                setIsLoading(!isLoading);
            }
        };

        fetchData();

    }, []);

    return (

        <div className={props.className}>
            <div className="card" id="info">
                <div id="bot_info">
                    <div className="avatar">
                        <h1>{botInfo && botInfo.nickname ? botInfo.nickname.substring(0, 2).toUpperCase() : ""}</h1>
                        <img className={botInfo && botInfo.avatar ? "" : "unactive_avatar"} src={botInfo && botInfo.avatar ? `https://api.telegram.org/file/bot${botInfo.token}/${botInfo.avatar}` : ""} />
                    </div>
                    <div id="bot_nickname">
                        <a id="bot_name">{botInfo ? botInfo.nickname : "UNDEFINED"}</a>
                        <a id="bot_username">{botInfo && botInfo.avatar ? "@" + botInfo.username : ""}</a>
                    </div>
                </div>
            </div>
            <div className="space"></div>
            <div className="card" id="settings">
                <div className="cardHeader">
                    <h1>Основные настройки</h1>
                </div>
                <div className="input_block" id="supplier">
                    <div className="input_container">
                        <label>Токен</label>
                        <div className="input_div">
                            <input id="token" className={errorToken ? "input_field active" : "input_field"}
                                type="text"
                                defaultValue={botInfo ? botInfo.token : ""}
                                placeholder="Введите токен бота"
                                onChange={handleTokenChange(setErrorToken, /^(\d+):([a-zA-Z0-9\-_]+)$/)}
                            />
                        </div>
                    </div>

                    <div className="input_container">
                        <label>ID Админа</label>
                        <div className="input_div">
                            <input id="admin_id" className={errorAdminId ? "input_field active" : "input_field"}
                                type="text"
                                defaultValue={botInfo ? botInfo.admin_id : ""}
                                placeholder="Введите ID Админа"
                                onChange={handleTokenChange(setErrorAdminId, /^\d+$/)}
                            />
                        </div>
                    </div>

                    <div className="input_container">
                        <label>Ссылка на поддержку</label>
                        <div className="input_div">
                            <input id="support_link" className={errorSupportLink ? "input_field active" : "input_field"}
                                type="text"
                                defaultValue={botInfo ? botInfo.support : ""}
                                placeholder="Введите ссылку на поддержку"
                                onChange={handleTokenChange(setErrorSupportLink, /^(http:\/\/|https:\/\/).*$/)}
                            />
                        </div>
                    </div>

                    <div className="input_container">
                        <label>Ссылка на сайт</label>
                        <div className="input_div">
                            <input id="website_link" className={errorWebsiteLink ? "input_field active" : "input_field"}
                                type="text"
                                defaultValue={botInfo ? botInfo.website : ""}
                                placeholder="Введите ссылку на сайт"
                                onChange={handleTokenChange(setErrorWebsiteLink, /^(http:\/\/|https:\/\/).*$/)}
                            />
                        </div>
                    </div>

                </div>

                <div className="accept_buttons">
                    <button id="accept_button" onClick={handleAcceptButton}>Сохранить</button>
                    <div className="space"></div>
                    <button id="decline_button" onClick={handleDeclineButton}>Отменить</button>
                </div>


            </div>
            <div className="space"></div>
            {dataTraffic ? (
                <div className="card" id="statistics">
                    <div className="cardHeader">
                        <h1>Статистика</h1>
                    </div>

                    <div className="stats_block">
                        <div className="chart_block">
                            <label>Переходы за 30 дней</label>
                            <BarComponent data={dataTraffic} label="Переходы" />
                            <div className="stats_text">
                                <div className="stats_text_field">
                                    <label>{dataTraffic[dataTraffic.length - 1].amount}</label>
                                    <p>Сегодня</p>
                                </div>
                                <div className="stats_text_field">
                                    <label>{dataTraffic[dataTraffic.length - 2].amount}</label>
                                    <p>Вчера</p>
                                </div>
                                <div className="stats_text_field">
                                    <label>{dataTrafficMonth}</label>
                                    <p>{`Месяц (${new Date().toLocaleString('default', { month: 'long' })})`}</p>
                                </div>
                                <div className="stats_text_field">
                                    <label>{dataTrafficGeneral}</label>
                                    <p>За все время</p>
                                </div>
                            </div>
                        </div>
                        <div className="chart_block">
                            <label>Покупки за 30 дней</label>
                            <BarComponent data={dataProfit} label="Сумма" symbol="₽" />
                            <div className="stats_text">
                                <div className="stats_text_field">
                                    <label>{dataProfit[dataProfit.length - 1].amount}₽</label>
                                    <p>Сегодня</p>
                                </div>
                                <div className="stats_text_field">
                                    <label>{dataProfit[dataProfit.length - 2].amount}₽</label>
                                    <p>Вчера</p>
                                </div>
                                <div className="stats_text_field">
                                    <label>{dataProfitMonth}₽</label>
                                    <p>{`Месяц (${new Date().toLocaleString('default', { month: 'long' })})`}</p>
                                </div>
                                <div className="stats_text_field">
                                    <label>{dataProfitGeneral}₽</label>
                                    <p>За все время</p>
                                </div>
                            </div>
                        </div>
                        {dataUsers ? (
                            <div id="pie_wrapper">
                                <label>Пользователи</label>
                                <DoughnutComponent data={dataUsers} label="Percentage" />
                            </div>
                        ) : (
                            <div id="pie_wrapper"></div>
                        )}

                    </div>
                </div>) : (
                <div className="card" id="statistics"></div>
            )}
            <div className={isLoading ? "loading active" : "loading"}>
                <div id="loading_1" className="loading_circle"></div>
                <div id="loading_2" className="loading_circle"></div>
                <div id="loading_3" className="loading_circle"></div>
            </div>
            
        </div>
    );
}

export { Home };