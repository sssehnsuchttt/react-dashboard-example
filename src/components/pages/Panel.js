import { useState, useEffect } from "react";
import './styles/Panel.css';
import { Navbar } from "../elements/Navbar";
import { NavbarButton } from "../elements/Navbar";
import { Home } from "./panel/Home";
import { Database } from "./panel/Database";
import { auth_path } from "../../config";
import { Navigate } from "react-router-dom";

function Panel() {
  const [accessToken, setAccessToken] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [botValue, setBotValue] = useState();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setBotValue(searchParams.get("bot"));
    let accessTokenValue = "accessToken";
    if (searchParams.get("bot")) {
      accessTokenValue = `accessToken_${searchParams.get("bot")}`;
    }
    const token = localStorage.getItem(accessTokenValue);
    setAccessToken(token);
    setLoading(false); 
  }, []);

  const handleNavItemClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!botValue) {
    return <div>Не указан бот</div>;
  }

  if (!accessToken) {
    return <Navigate to={`${auth_path}?bot=${botValue}`} />;
  }

  return (
    <div className="Panel">
      {activeSection === "home" && (
        <Home className="container" bot={botValue}></Home>
      )}

      {activeSection === "database" && (
        <Database className="container" bot={botValue}></Database>
      )}

      <Navbar>
        <NavbarButton
          active={activeSection === "home"}
          onClick={() => handleNavItemClick("home")}
          icon="uil uil-estate"
          text="Главная"
        />
        <NavbarButton
          active={activeSection === "items"}
          onClick={() => handleNavItemClick("items")}
          icon="uil uil-shopping-cart"
          text="Товары"
        />
        <NavbarButton
          active={activeSection === "database"}
          onClick={() => handleNavItemClick("database")}
          icon="uil uil-database"
          text="База данных"
        />
      </Navbar>
    </div>
  );
}

export { Panel };
