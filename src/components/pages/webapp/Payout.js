import React, { useState, useEffect } from "react";
import "./styles/Payout.css";
import { useLoading } from "../../elements/Loading"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
const tg = window.Telegram.WebApp;

function Payout(props) {
    const loading = useLoading();
    const [selectedOption, setSelectedOption] = useState('card');

    const [propsHint, setPropsHint] = useState("");
    const [propsPayout, setPropsPayout] = useState("");
    const [propsBank, setPropsBank] = useState("");
    const [commissionPercent, setCommissionPercent] = useState(0);
    const [commissionFee, setCommissionFee] = useState(null);
    const [commissionFromPayout, setCommissionFromPayout] = useState(true);
    const [minimumAmount, setMinimumAmount] = useState();
    const [receivedAmount, setReceivedAmount] = useState();
    const [debitAmount, setDebitAmount] = useState();
    const [isValidAmount, setIsValidAmount] = useState(false);
    const [inputType, setInputType] = useState();
    const [balance, setBalance] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [payoutsHistory, setPayoutsHistory] = useState([]);
    const [isPayoutButtonActive, setIsPayoutButtonActive] = useState(false);
    const [payoutOptions, setPayoutOptions] = useState({
        card: {
            name: "",
            hint: "",
            commissionFee: 0,
            commissionPercent: 0,
            minimumAmount: 0,
            type: "",
        }
    });

    const fetchData = async () => {
        try {
            //loading.show();
            const response = await props.botRequest.request("post", "/webapp/balance", { userid: props.initData.user.id });
            const payouts_history = await props.botRequest.request("post", "/webapp/payouts_history", { userid: props.initData.user.id });
            setBalance(response.data.balance);
            setPayoutOptions(response.data.payout_options);
            setPayoutsHistory(payouts_history.data);
            setIsLoaded(false);
        } catch (error) {
            console.log("Ошибка при получении данных:", error);
        }
        finally {
            setIsLoaded(true);
            //loading.hide();
        }
    };

    const makePayout = async (payoutProps, amount, amount_orig, method, bank) => {
        try {

            var commission_type = 0;
            if (commissionFromPayout)
                commission_type = 1;
            const response = await props.botRequest.request("post", "/webapp/payout", { userid: props.initData.user.id, props: payoutProps, formattedProps: document.getElementById("props_payout").value, amount: amount, amount_orig: amount_orig, commission_type: commission_type, method: method, bank: bank, method_name: document.getElementById("select_methods").options[document.getElementById("select_methods").selectedIndex].text });
        }
        finally {
            tg.close();
        }
    }


    useEffect(() => {
        fetchData();
    }, []);



    const handleSelectOption = (event) => {
        const selectedValue = event.target.value;
        setSelectedOption(selectedValue);
    };

    const handleSelectBank = (event) => {
        const selectedValue = event.target.value;
        setPropsBank(selectedValue);
    };


    const handleCommissionSwitch = (event) => {
        const switchValue = event.target.checked;
        setCommissionFromPayout(switchValue);
    };

    const handlePayoutHistory = (amount, amount_orig, commission_type, props, method, bank) => {

        const selectMethods = document.getElementById("select_methods");
        for (let i = 0; i < selectMethods.options.length; i++) {
            if (selectMethods.options[i].value === method) {
                selectMethods.selectedIndex = i;
                break;
            }
        }
        setSelectedOption(method);
        document.getElementById("amount_payout").value = amount_orig;



        setTimeout(() => {
            document.getElementById("amount_payout").dispatchEvent(new Event("change"));
            document.getElementById("props_payout").value = props;
            document.getElementById("props_payout").dispatchEvent(new Event("change"));
            if (commission_type == 1)
                setCommissionFromPayout(true);
            else
                setCommissionFromPayout(false);
            const selectBank = document.getElementById("select_bank");
            if (selectBank) {
                for (let i = 0; i < selectBank.options.length; i++) {
                    if (selectBank.options[i].value === bank) {
                        selectBank.selectedIndex = i;
                        break;
                    }
                }
                setPropsBank(bank);
            }
        }, 100);


    }

    const handlePayoutButton = () => {
        if (isPayoutButtonActive === true) {
            tg.showPopup({
                title: 'Подтвердите действие',
                message: `Вы действительно хотите вывести средства на сумму ${document.getElementById("amount_debit").value}₽?`,
                buttons: [
                    { id: 'payout', type: 'default', text: 'Подтвердить' },
                    { type: 'destructive', text: 'Отменить' },
                ]
            }, async function (buttonId) {
                if (buttonId === 'payout') {
                    const selectMethods = document.getElementById("select_methods");
                    const selectedMethod = selectMethods.options[selectMethods.selectedIndex].value;
                    let selectedBank = null;

                    if (selectedMethod === "sbp") {
                        const selectBanks = document.getElementById("select_bank");
                        selectedBank = selectBanks.options[selectBanks.selectedIndex].value;
                    }

                    const payoutProps = document.getElementById("props_payout").value.replace(/\D/g, '');
                    const amount = document.getElementById("amount_debit").value.replace(/,/g, '.').replace(/[^\d.]/g, '');
                    const amount_orig = document.getElementById("amount_payout").value;
                    makePayout(payoutProps, amount, amount_orig, selectedMethod, selectedBank)
                }
            });
        }
    }

    const handleProps = (event) => {
        const input = event.target;
        let value = input.value;

        if (inputType === "bank_card") {
            const regex = /[^0-9]+/gi;
            if (regex.test(value)) {
                value = value.replace(regex, '');
            }
            const maxLength = 16;
            const delimiter = ' ';
            const length = value.length;

            if (length > maxLength) {
                value = value.substring(0, maxLength);
            }

            const paddedValue = value.padEnd(maxLength, ' ');
            const groups = paddedValue.match(/.{1,4}/g) || [];
            const formattedValue = groups.join(delimiter).trim();

            if (formattedValue !== input.value) {
                input.value = formattedValue;
            }
            setPropsPayout(formattedValue);
        } else if (inputType === "phone_number") {
            const inputString = value.replace(/\D/g, '');

            let resultString = "+";
            for (let i = 0; i < inputString.length; i++) {
                if (i == 1)
                    resultString += " (";
                else if (i == 4)
                    resultString += ") ";
                else if (i == 7)
                    resultString += "-";
                else if (i == 9)
                    resultString += "-";
                else if (i == 9)
                    resultString += "-";

                if (i == 0)
                    resultString += 7;
                else
                    resultString += inputString[i];
            }

            if (resultString.length > 17)
                resultString = resultString.slice(0, 18);
            setPropsPayout(resultString);
            input.value = resultString;

        }
    };

    const handleAmount = () => {
        const input = document.getElementById("amount_payout");

        if (input) {
            const regex = /^(\d+|\d+\.\d{1,2})$/;

            if (regex.test(input.value)) {
                const amount = parseFloat(input.value);
                setIsValidAmount(true);
                const { commissionPercent: percent, commissionFee: fee } = payoutOptions[selectedOption];
                const reducedAmount = amount * (1 - (percent / 100)) - fee;
                const increasedAmount = amount * (1 + (percent / 100)) + fee;
                if (commissionFromPayout) {
                    let receivedAmount = parseFloat(reducedAmount.toFixed(2));
                    if (receivedAmount <= 0) {
                        receivedAmount = 0;
                    }
                    setReceivedAmount(receivedAmount);
                    setDebitAmount(amount);
                } else {
                    setReceivedAmount(amount);
                    setDebitAmount(parseFloat(increasedAmount.toFixed(2)));
                }
            } else {
                setIsValidAmount(false);
                setReceivedAmount(null);
                setDebitAmount(null);
            }
        }
    };

    useEffect(() => {
        if (isLoaded)
            handleAmount();
    }, [commissionFee, commissionPercent, commissionFromPayout]);

    useEffect(() => {
        if (isLoaded) {
            setPropsHint(payoutOptions[selectedOption].hint);
            setCommissionFee(payoutOptions[selectedOption].commissionFee);
            setCommissionPercent(payoutOptions[selectedOption].commissionPercent);
            setMinimumAmount(payoutOptions[selectedOption].minimumAmount);
            setInputType(payoutOptions[selectedOption].type);
        }
    }, [selectedOption, propsBank, payoutOptions]);

    useEffect(() => {
        if (isLoaded) {
            const input = document.getElementById("props_payout")
            if (input)
                input.value = "";
        }
    }, [inputType]);

    useEffect(() => {
        if (isLoaded) {
            const props = document.getElementById("props_payout").value.replace(/\D/g, '');
            let regex = /^7\d{10}$/;
            if (inputType == "bank_card")
                regex = /^\d{16}$/;

            if ((regex.test(props)) && (receivedAmount >= minimumAmount) && (debitAmount <= balance)) {
                setIsPayoutButtonActive(true);
            }
            else
                setIsPayoutButtonActive(false);
        }
    }, [receivedAmount, balance, propsPayout, minimumAmount]);


    if (isLoaded) {
        return (
            <div className={props.className}>
                <div className="card" id="link">
                    <div className="cardHeader">
                        <h1>Вывод средств</h1>
                    </div>
                    <h1 className="balance">{typeof balance === 'number' ? balance.toLocaleString('ru-RU') + '₽' : '' || <Skeleton height={40} width={200} />}</h1>
                    <div className="input_block">
                        <div className="input_container">
                            <label>Способ</label>
                            <select id="select_methods" onChange={handleSelectOption}>
                                {Object.keys(payoutOptions).map((option) => (
                                    <option key={option} value={option}>
                                        {payoutOptions[option].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input_container">
                            <label>Реквизиты</label>
                            <div className="input_div">
                                <input id="props_payout" className="input_field"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder={propsHint}
                                    onChange={handleProps}
                                ></input>
                            </div>
                        </div>
                        {selectedOption === "sbp" && (
                            <div className="input_container">
                                <label>Банк</label>
                                <select id="select_bank" onChange={handleSelectBank}>
                                    {payoutOptions[selectedOption].banks.map((bank) => (
                                        <option key={bank} value={bank}>
                                            {bank}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="input_container">
                            <label>Сумма</label>
                            <div className="input_div">
                                <input id="amount_payout" className="input_field"
                                    type="text"
                                    inputMode="numeric"
                                    onChange={handleAmount}
                                />
                                <a id="currency_symbol">₽</a>
                            </div>
                        </div>
                        <div className="input_container" style={{ width: `calc(50% - var(--margin)*2)` }}>
                            <label>К списанию</label>
                            <div className="input_div">
                                <input id="amount_debit" className="input_field"
                                    type="text"
                                    defaultValue={typeof debitAmount === 'number' ? debitAmount.toLocaleString('ru-RU') : ''}
                                    readOnly
                                />
                                <a id="currency_symbol">₽</a>
                            </div>
                        </div>
                        <div className="input_container" style={{ width: `calc(50% - var(--margin)*2)` }}>
                            <label>К получению</label>
                            <div className="input_div">
                                <input id="amount_received" className="input_field"
                                    type="text"
                                    defaultValue={typeof receivedAmount === 'number' ? receivedAmount.toLocaleString('ru-RU') : ''}
                                    readOnly
                                />
                                <a id="currency_symbol">₽</a>
                            </div>
                        </div>
                        <div className="input_container">
                            <label>Комиссия</label>
                            <div className="toggle_container">
                                <p className={commissionFromPayout ? "commission_label unactive" : "commission_label"}>С баланса</p>
                                <input type="checkbox" id="switch" checked={commissionFromPayout} onChange={handleCommissionSwitch} /><label className="switch" for="switch"></label>
                                <p className={commissionFromPayout ? "commission_label" : "commission_label unactive"}>С платежа</p>
                            </div>
                            <div className="commission_info">
                                <i className="bi bi-exclamation-circle active"></i>
                                <p>Комиссия: {commissionPercent}%{commissionFee && ` + ${commissionFee}₽`}</p>
                            </div>
                            <div className="commission_info">
                                <i className="bi bi-exclamation-circle active"></i>
                                <p>Минимальная сумма: {minimumAmount}₽</p>
                            </div>
                            <div className="space"></div>
                            <button className={isPayoutButtonActive ? "payout_button active" : "payout_button"} onClick={handlePayoutButton}>Вывести</button>
                        </div>
                    </div>
                </div>

                <div className="space"></div>
                {payoutsHistory.length > 0 ? (
                    <div className="card" id="link">
                        <div className="cardHeader">
                            <h1>История выводов</h1>
                        </div>
                        <div className="space"></div>
                        {payoutsHistory.map((payout, index) => (
                            <div className="payout_container" key={index} onClick={() => handlePayoutHistory(payout.amount, payout.amount_orig, payout.commission_type, payout.props, payout.method, payout.bank)}>

                                <div className="payout_info_container">
                                    <div className="payout_history">
                                        <div className="payout_history_upper">
                                            <h2>{typeof parseFloat(payout.amount) === 'number' ? parseFloat(payout.amount).toLocaleString('ru-RU') + '₽' : '' || <Skeleton width={100} />}</h2>
                                            <h2 className="payout_history_props">{payout.props}</h2>
                                        </div>
                                        <div className="payout_history_lower">
                                            <div className="payout_method">
                                                <img className="payout_icon" src={process.env.PUBLIC_URL + `/icons/${payout.method}.svg`} alt={payout.bank} />
                                                <p>{payout.method_str}</p>
                                            </div>
                                            <p>{payout.date}</p>
                                        </div>
                                    </div>

                                    <i
                                        id="status_icon"
                                        className={`uil ${payout.status_str === 'DONE'
                                            ? 'uil uil-check-circle'
                                            : payout.status_str === 'CANCELED'
                                                ? 'uil uil-exclamation-circle'
                                                : 'uil-clock'
                                            }`}
                                    ></i>
                                </div>
                            </div>
                        ))}

                        <div className="space"></div>
                    </div>
                ) : (null)}
            </div>
        );
    }
    else {
        return (
            <div className={props.className}>
                <div className="card" id="link">
                    <div className="cardHeader">
                        <h1><Skeleton width={150}></Skeleton></h1>
                    </div>
                    <h1 className="balance"><Skeleton height={40} width={160} /></h1>
                    <div className="input_block">
                        <div className="input_container">
                            <label><Skeleton width={100}></Skeleton></label>
                            <Skeleton width="100%" height={"2.5rem"} borderRadius="6px"></Skeleton>
                        </div>
                        <div className="input_container">
                            <label><Skeleton width={100}></Skeleton></label>
                            <Skeleton width="100%" height={"2.5rem"} borderRadius="6px"></Skeleton>
                        </div>
                        <div className="input_container">
                            <label><Skeleton width={100}></Skeleton></label>
                            <Skeleton width="100%" height={"2.5rem"} borderRadius="6px"></Skeleton>
                        </div>
                        <div className="input_container" style={{ width: `calc(50% - var(--margin)*2)` }}>
                            <label><Skeleton width={100}></Skeleton></label>
                            <Skeleton width="100%" height={"2.5rem"} borderRadius="6px"></Skeleton>
                        </div>
                        <div className="input_container" style={{ width: `calc(50% - var(--margin)*2)` }}>
                            <label><Skeleton width={100}></Skeleton></label>
                            <Skeleton width="100%" height={"2.5rem"} borderRadius="6px"></Skeleton>
                        </div>
                        <div className="input_container">
                            <label><Skeleton width={100}></Skeleton></label>
                            <div className="toggle_container">
                                <Skeleton width={200} height={30}></Skeleton>
                            </div>
                            <div className="commission_info">
                                <p><Skeleton width={140}></Skeleton></p>
                            </div>
                            <div className="commission_info">
                                <p><Skeleton width={140}></Skeleton></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export { Payout };