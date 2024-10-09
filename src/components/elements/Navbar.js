import React, { useState, useContext, useRef, useEffect } from "react";
import "./styles/Navbar.css";
import { Navigate } from "react-router-dom";
import { ThemeContext } from '../contexts/Theme.js';
import { auth_path } from "../../config";

function Navbar(props) {
  const navExitRef = useRef(null);
  const navUserRef = useRef(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [redirectToAuth, setRedirectToAuth] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const login = localStorage.getItem("login");
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const searchParams = new URLSearchParams(window.location.search);
  const bot = searchParams.get("bot");

  const handleMobileClick = () => {
    setIsMobileOpen(!isMobileOpen);
    setIsExitOpen(false);
  };

  const handleToggleTheme = () => {
    setIsExitOpen(false);
    toggleTheme();
  };

  useEffect(() => {
    const navUserHeight = navUserRef.current.offsetHeight;
    navExitRef.current.style.transform = `translateY(-${navUserHeight}px)`;
  }, []);

  const handleExit = () => {
    setIsExitOpen(false);

    if (bot) {
      localStorage.removeItem(`accessToken_${bot}`);
      localStorage.removeItem(`refreshToken_${bot}`);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    localStorage.removeItem("login");

    setRedirectToAuth(true);
  };

  const handleOpenExitWindow = () => {
    setIsExitOpen(!isExitOpen);
  };

  if (redirectToAuth) {
    return <Navigate to={bot ? `${auth_path}?bot=${bot}` : `${auth_path}`} />;
  }

  return (
    <nav className={isMobileOpen ? "nav active" : "nav"}>
      <div>
        <ul id="navbar" className={isMobileOpen ? "#navbar active" : "#navbar"}>
          <div id="closeDiv">
            <div id="closeBtn" onClick={handleMobileClick}>
              <i className="bi bi-x"></i>
            </div>
          </div>

          <div id="logo">
            <i id="logo-icon" className="bi bi-robot"></i>
            <h1>Admin Panel</h1>
          </div>
          <div className="buttons">
            {props.children}
          </div>
          <hr></hr>
          <div ref={navUserRef} className="navUser">
            <div ref={navExitRef} className={isExitOpen ? "navExit" : "navExit closed"}>
              <div className="navFooterButton" id="logout" onClick={handleExit}>
                <i className="uil uil-signin"></i>
                <p className="navbarPopupText">Выйти</p>
              </div>
              <div className="navFooterButton" id="theme" onClick={handleToggleTheme}>
                <i id="themeIcon" className={theme === "dark" ? "uil uil-sun" : "uil uil-moon"}></i>
                <p className="navbarPopupText">Сменить тему</p>
              </div>
            </div>
            <div className="navLogin" onClick={handleOpenExitWindow}>
              <i className="uil uil-user"></i>
              <h1>Login: {login}</h1>
              <i id="footerAngle" className={isExitOpen ? "uil uil-angle-down" : "uil uil-angle-down closed"}></i>
            </div>
          </div>
        </ul>
      </div>
      <div className={isMobileOpen ? "bg active" : "bg"} onClick={handleMobileClick}></div>
      <div id="mobile" onClick={handleMobileClick}>
        <i className="bi bi-list"></i>
      </div>
    </nav>
  );
}

function NavbarButton(props) {
  return (
    <li className={props.active ? "active" : ""} onClick={props.onClick}>

      <div className={props.active ? "navbarBtnText active" : "navbarBtnText"}>
        <i className={props.icon}></i>
        <a>{props.text}</a>
      </div>
    </li>
  );
}

function NavbarHorizontalButton(props) {
  return (
    <div className={props.active ? "navbarBtnTextHorizontal active" : "navbarBtnTextHorizontal"} onClick={props.onClick}>
      <div className="navbarHorizontalContainer">
        <a className={props.active ? "navbarTextHorizontal active" : "navbarTextHorizontal"}>{props.text}</a>
      </div>
    </div>
  );
}

function NavbarHorizontal(props) {
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [indicatorPointerWidth, setIndicatorPointerWidth] = useState(0);

  const calculateIndicatorPosition = () => {
    const activeButton = document.querySelector('.navbarBtnTextHorizontal.active');
    const navbarHorizontalContainer = activeButton.querySelector('.navbarHorizontalContainer');
    setIndicatorPosition(activeButton.offsetLeft);
    setIndicatorWidth(activeButton.offsetWidth);
    setIndicatorPointerWidth(navbarHorizontalContainer.offsetWidth);
  };

  const indicatorStyle = {
    width: indicatorWidth,
    left: indicatorPosition,
    transition: 'left 0.15s ease',
  };

  const indicatorPointerStyle = {
    width: indicatorPointerWidth,
  };

  useEffect(() => {
    calculateIndicatorPosition();
  }, [props.active]);

  return (
    <div className={props.hidden ? "navbarHorizontal hidden" : "navbarHorizontal"}>
      {React.Children.map(props.children, (child) => {
        return React.cloneElement(child, {
          active: child.props.active,
          onClick: () => {
            child.props.onClick();
            setTimeout(() => {
              calculateIndicatorPosition();
            }, 0);
          },
        });
      })}
      <div className="navbarIndicator" id="navbarIndicator" style={indicatorStyle}>
        <div className="navbarPointer" style={indicatorPointerStyle}></div>
      </div>
    </div>
  );
}

export { Navbar, NavbarButton, NavbarHorizontal, NavbarHorizontalButton };
