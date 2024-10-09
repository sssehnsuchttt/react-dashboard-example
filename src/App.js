import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import { Panel } from "./components/pages/Panel";
import { Auth } from "./components/pages/Auth";
import { WebApp } from "./components/pages/TelegramWeb";
import './App.css';
import { ThemeProvider } from './components/contexts/Theme.js';
import { AlertProvider } from "./components/elements/Alert";
import { NotificationProvider } from "./components/elements/Notification";
import { LoadingProvider } from "./components/elements/Loading";
function App() {

  return (

    <ThemeProvider>
      <LoadingProvider>
        <NotificationProvider>
          <AlertProvider>

            <Router basename="/dashboard_example">
              <Routes>
                <Route exact path="/auth" element={<Auth />} />
                <Route exact path="/panel" element={<Panel />} />
                <Route exact path="/webapp" element={<WebApp />} />
              </Routes>
            </Router>

          </AlertProvider>
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;