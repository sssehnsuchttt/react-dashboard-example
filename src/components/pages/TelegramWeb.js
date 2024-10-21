import React, { useState, useEffect, useRef } from "react";
import "./styles/TelegramWeb.css";
import axios from "axios";
import { site } from "../../config.js";
import RequestHandler from "../../ProtectedRequest";
import { Referer } from "./webapp/Referer";
import { Payout } from "./webapp/Payout";
import { useLoading } from "../elements/Loading"
import { NavbarHorizontal, NavbarHorizontalButton } from "../elements/Navbar";
import Lottie from "lottie-react";
import unavailable_animation from "../../lottie/sad_out.json"
import SwipeableView from "../elements/SwipeableView";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const tg = window.Telegram.WebApp;


function WebApp() {
    const loading = useLoading();
    const [initData, setInitData] = useState();
    const [botValue, setBotValue] = useState();
    const [checkData, setCheckData] = useState();
    const [isHidden, setIsHidden] = useState(false);
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const webAppScroller = useRef(null);
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setBotValue(searchParams.get("bot"));
        setInitData(tg.initDataUnsafe);
    }, []);

    const fetchData = async (botRequest) => {
        try {
            const request = await botRequest.request("post", "/webapp/check", { userid: initData.user.id });
            console.log(request.data);
            setCheckData(request.data);
        }
        catch {
            setIsError(true);
        }
    }

    const handleNavItemClick = (sectionId) => {
        setActiveSection(sectionId);
        webAppScroller.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });

    };


    useEffect(() => {
        tg.MainButton.hide();
    }, [activeSection])

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-links', tg.themeParams.link_color);
        root.style.setProperty('--color-text', tg.themeParams.text_color);
        root.style.setProperty('--color-hr', tg.themeParams.hint_color);
        root.style.setProperty('--color-background', tg.themeParams.bg_color);
        root.style.setProperty('--color-section-separator', tg.themeParams.section_separator_color);
        root.style.setProperty('--color-secondary-background', tg.themeParams.secondary_bg_color);
        root.style.setProperty('--color--input', tg.themeParams.bg_color);
        root.style.setProperty('--color-nav-highlight', `rgba(${parseInt(tg.themeParams.hint_color.slice(1), 16) >> 16 & 255}, ${parseInt(tg.themeParams.hint_color.slice(1), 16) >> 8 & 255}, ${parseInt(tg.themeParams.hint_color.slice(1), 16) & 255}, 0.3)`);
    }, [])
    useEffect(() => {
        if (initData && botValue && !checkData) {
            const botRequest = new RequestHandler(site, botValue, tg.initDataUnsafe.hash, tg.initData);
            fetchData(botRequest);
        }
    }, [initData, botValue, checkData]);


    if (checkData) {
        const botRequest = new RequestHandler(site, botValue, tg.initDataUnsafe.hash, tg.initData);
        if (checkData.user === "referer")
        {
            return (
                <div className="WebApp">
                    <SkeletonTheme borderRadius="10px" baseColor={document.documentElement.style.getPropertyValue('--color--input')} highlightColor={document.documentElement.style.getPropertyValue('--color-nav-highlight')}>
                    <SwipeableView>
                        <Referer className="containerWebApp" initData={initData} botRequest={botRequest} text="Главная"></Referer>
                        <Payout className="containerWebApp" initData={initData} botRequest={botRequest} text="Вывод"></Payout>
                    </SwipeableView>
                    </SkeletonTheme>
                    
                </div>
            );
        }
        else if (checkData.user === "admin")
        {
            return (
                <div className="WebApp">
                    <SkeletonTheme borderRadius="10px" baseColor={document.documentElement.style.getPropertyValue('--color--input')} highlightColor={document.documentElement.style.getPropertyValue('--color-nav-highlight')}>
                    <SwipeableView>
                        <Payout className="containerWebApp" initData={initData} botRequest={botRequest} text="Вывод"></Payout>
                    </SwipeableView>
                    </SkeletonTheme>
                    
                </div>
            );
        }
    }
    else if (isError) {
        return (
            <div className="ServerUnavailable">
                <div className="UnavailableContainer">
                    <Lottie className="unavailable_animation" animationData={unavailable_animation} loop={true} />
                    <h1>Бот временно недоступен</h1>
                </div>
            </div>
        )
    }

    return null;
}

export { WebApp };
