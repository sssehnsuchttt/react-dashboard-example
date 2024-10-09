import React, { useState, useEffect } from "react";
import Skeleton from 'react-loading-skeleton'
import { BarComponent, DoughnutComponent } from "../../elements/Charts";
import "./styles/Stats.css";
import { useLoading } from "../../elements/Loading"

const tg = window.Telegram.WebApp;

function Stats(props) {
    const loading = useLoading();
    const [dataTraffic, setDataTraffic] = useState(null);
    const [dataProfit, setDataProfit] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataTrafficMonth, setDataTrafficMonth] = useState(null);
    const [dataProfitMonth, setDataProfitMonth] = useState(null);
    const [dataTrafficGeneral, setDataTrafficGeneral] = useState(null);
    const [dataProfitGeneral, setDataProfitGeneral] = useState(null);

    useEffect(() => {
        //loading.show();
        const fetchData = async () => {
            try {
                const request = await props.botRequest.request("post", "/webapp/stats", { userid: props.initData.user.id });
                setDataProfit(request.data.profit);
                setDataProfitMonth(request.data.profit_month);
                setDataProfitGeneral(request.data.profit_general);
                setDataTraffic(request.data.traffic);
                setDataTrafficMonth(request.data.traffic_month);
                setDataTrafficGeneral(request.data.traffic_general);



            } catch (error) {
                console.log("Ошибка при получении данных:", error);
            } finally {
                //loading.hide();

                setIsLoaded(true);
            }
        };

        fetchData();


    }, []);


    if (isLoaded) {
        return (
            <div className={props.className}>
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

                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className={props.className}>
                <div className="card" id="statistics">
                    <div className="cardHeader">
                        <h1><Skeleton width={150}></Skeleton></h1>
                    </div>

                    <div className="stats_block">
                        {Array.from({ length: 2 }, (_, index) => (
                            <div className="chart_block" key={index}>
                                <label><Skeleton width={100} /></label>
                                <BarComponent data={[]} label="Переходы" />
                                <div className="stats_text">
                                    {Array.from({ length: 4 }, (_, i) => (
                                        <div className="stats_text_field" key={i}>
                                            <Skeleton width={40} />
                                            <Skeleton width={70} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        );
    }
}

export { Stats };