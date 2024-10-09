import React, { useState, useEffect } from "react";
import "./styles/Notification.css";

const NotificationContext = React.createContext();

const NotificationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState("");
  const [header, setHeader] = useState("");
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  
  const show = (header, text, icon, color) => {
    setIsOpen(true);
    setHeader(header);
    setText(text);
    setIcon(icon);
    setColor(color);
    const timer = setTimeout(() => {
        setIsOpen(false);
    }, 2000);
    
  };

    return (
      <NotificationContext.Provider value={{ show }}>
        {children}
        <div id="notification" onClick={() => setIsOpen(false)} className={isOpen ? "notification active" : "notification"}>
          <div className="notification_header">
            {icon && (
              <i className={icon}></i>
            )}
            <label>{header}</label>
          </div>
          <h1 id="notification_text">{text}</h1>
        </div>
      </NotificationContext.Provider>
      );
}

const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within an NotificationProvider");
  }
  return context;
};

export { NotificationProvider, useNotification };
