import { Analyze } from "pages/Analyze";
import { BoardEditor } from "pages/BoardEditor";
import { MainPage } from "pages/MainPage";
import { MyChessAi } from "pages/MyChessAi";
import { NotFound } from "pages/NotFound";
import { Play } from "pages/Play";
import { StockfishOnline } from "pages/StockfishOnline";
import { RouteProps } from "react-router-dom";

export enum AppRoutes {
  MAIN = "main",
  PLAY = "play",
  ANALYZE = "analyze",
  BOARD_EDITOR = "board_editor",
  STOCKFISH_ONLINE = "stockfish_online",
  MY_CHESS_AI = "my_chess_ai",
  NOT_FOUND = "not-found",
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: "/",
  [AppRoutes.PLAY]: "/play",
  [AppRoutes.ANALYZE]: "/analyze",
  [AppRoutes.BOARD_EDITOR]: "/board-editor",
  [AppRoutes.STOCKFISH_ONLINE]: "/stockfish-online",
  [AppRoutes.MY_CHESS_AI]: "/my-chess-ai",
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
  [AppRoutes.BOARD_EDITOR]: {
    path: RoutePath[AppRoutes.BOARD_EDITOR],
    element: <BoardEditor />,
  },
  [AppRoutes.STOCKFISH_ONLINE]: {
    path: RoutePath[AppRoutes.STOCKFISH_ONLINE],
    element: <StockfishOnline />,
  },
  [AppRoutes.MY_CHESS_AI]: {
    path: RoutePath[AppRoutes.MY_CHESS_AI],
    element: <MyChessAi />,
  },
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath[AppRoutes.NOT_FOUND],
    element: <NotFound />,
  },
};
