import { Analyze } from "pages/Analyze";
import { MainPage } from "pages/MainPage";
import { NotFound } from "pages/NotFound";
import { Play } from "pages/Play";
import { StockfishOnline } from "pages/StockfishOnline";
import { RouteProps } from "react-router-dom";

export enum AppRoutes {
  MAIN = "main",
  PLAY = "play",
  ANALYZE = "analyze",
  STOCKFISH_ONLINE = "stockfish_online",
  NOT_FOUND = "not-found",
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: "/",
  [AppRoutes.PLAY]: "/play",
  [AppRoutes.ANALYZE]: "/analyze",
  [AppRoutes.STOCKFISH_ONLINE]: "/stockfish-online",
  // последний
  [AppRoutes.NOT_FOUND]: "*",
};

export const routeConfig: Record<AppRoutes, RouteProps> = {
  [AppRoutes.MAIN]: {
    path: RoutePath[AppRoutes.MAIN],
    element: <MainPage />,
  },
  [AppRoutes.PLAY]: {
    path: RoutePath[AppRoutes.PLAY],
    element: <Play />,
  },
  [AppRoutes.ANALYZE]: {
    path: RoutePath[AppRoutes.ANALYZE],
    element: <Analyze />,
  },
  [AppRoutes.STOCKFISH_ONLINE]: {
    path: RoutePath[AppRoutes.STOCKFISH_ONLINE],
    element: <StockfishOnline />,
  },
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath[AppRoutes.NOT_FOUND],
    element: <NotFound />,
  },
};
