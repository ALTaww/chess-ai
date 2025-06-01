import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { HashRouter } from "react-router-dom";
import { ErrorBoundary } from "./app/providers/ErrorBoundary";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter basename="chess-ai">
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);
