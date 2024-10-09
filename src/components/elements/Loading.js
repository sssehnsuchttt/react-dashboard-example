import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import loading_animation from "../../lottie/social_out.json"
import "./styles/Loading.css"

const LoadingContext = React.createContext();

const LoadingProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const show = () => {
    setIsVisible(true);
  };

  const hide = () => {
    setIsAnimating(true);
    setIsVisible(false);
  };

  return (
    <LoadingContext.Provider value={{ show, hide }}>
      {children}
      <div className={isVisible ? `loading_screen ${isAnimating ? "withAnimation" : ""}` : "loading_screen invisible"}></div>
      <div className={isVisible ? "loading_screen" : `loading_screen ${isAnimating ? "invisible_animated" : "invisible"}`}>
        <Lottie className={isVisible ? "loading_animations" : "loading_animations invisible"} animationData={loading_animation} loop={true} />
      </div>
    </LoadingContext.Provider>
  );
};

const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within an LoadingProvider");
  }
  return context;
};


export { LoadingProvider, useLoading };