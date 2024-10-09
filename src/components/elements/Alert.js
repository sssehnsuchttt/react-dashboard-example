import React, { useState } from "react";
import "./styles/Alert.css";

const AlertContext = React.createContext();

const AlertProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [header, setHeader] = useState("");
  const [text, setText] = useState("");
  const [acceptText, setAcceptText] = useState("");
  const [declineText, setDeclineText] = useState("");
  const [acceptCallback, setAcceptCallback] = useState(null);
  const [declineCallback, setDeclineCallback] = useState(null);

  const show = (alertHeader, alertText, accept, decline, onAccept, onDecline) => {
    setHeader(alertHeader);
    setText(alertText);
    setAcceptText(accept);
    setDeclineText(decline);
    setAcceptCallback(() => onAccept);
    setDeclineCallback(() => onDecline);
    setIsOpen(true);
  };

  const accept = () => {
    if (acceptCallback) {
      acceptCallback();
    }
    setIsOpen(false);
  };

  const decline = () => {
    if (declineCallback) {
      declineCallback();
    }
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <div className={isOpen ? "alert_bg active" : "alert_bg"} onClick={decline}>
        <div className={isOpen ? "alert_window active" : "alert_window"}>
          <div className="header">
            <h1>{header}</h1>
          </div>
          <div className="text_field">
            <h1>{text}</h1>
          </div>
          <div className="buttons_field">
            <button onClick={accept}>{acceptText}</button>
            <button id="alert_decline_button" onClick={decline}>
              {declineText}
            </button>
          </div>
        </div>
      </div>
    </AlertContext.Provider>
  );
};

const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export { AlertProvider, useAlert };
