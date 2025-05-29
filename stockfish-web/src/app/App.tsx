import "./styles/index.scss";
import { classNames } from "shared/lib/classNames/classNames";
import { AppRouter } from "app/providers/router";
import { Suspense, useEffect } from "react";
import { Navbar } from "widgets/Navbar";

const App = () => {
  return (
    <div className={classNames("app", {}, [])}>
      <Suspense fallback={null}>
        <Navbar />
        <div className="content-page">
          <AppRouter />
        </div>
      </Suspense>
    </div>
  );
};

export default App;
