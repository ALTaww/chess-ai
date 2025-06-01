import { classNames } from "shared/lib/classNames/classNames";
import cls from "./StockfishOnlineChessboard.module.scss";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { useEffect, useMemo, useRef, useState } from "react";
import Chess from "chess.js";
import { Chessboard, ChessboardDnDProvider } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { sounds } from "shared/lib/sounds/sounds";
import { useLocation } from "react-router-dom";
import { urlParams } from "shared/config/consts/urlParams";
import axios from "axios";
import { createNewAbortController } from "shared/lib/createNewAbortController/createNewAbortController";

interface StockfishOnlineChessboardProps {
  className?: string;
  defaultPosition?: string;
}

interface LevelsConfig {
  text: string;
  depth: number;
}

type BestMoveString = `bestmove ${string} ponder ${string}`;

interface ApiResponse {
  success: boolean;
  evaluation: number | null; // Либо содержит стандартную оценку данной позиции, либо null, если есть форсированный мат.
  mate: null | number; // (положительно, когда мат ставят белые, отрицательно, когда мат ставят черные)
  bestmove: BestMoveString; // Содержит лучший ход в данной позиции
  continuation: string; // Верхняя линия двигателя в позиции.
  data?: unknown; // информация об ошибке
}

// Уровни с комбинированными параметрами
const levels: Record<string, LevelsConfig> = {
  easy: {
    text: "Легко 🤓",
    depth: 5, // Ограниченная глубина
  },
  normal: {
    text: "Нормально 🧐",
    depth: 8, // Умеренная глубина
  },
  hard: {
    text: "Сложно 😵",
    depth: 15, // Глубокая аналитика
  },
};

function parseBestMoveLine(line: string): {
  bestMove: string | null;
  ponder: string | null;
} {
  // Регулярное выражение для обработки строки bestmove
  const bestMoveMatch = line.match(/^bestmove\s+(\S{4,6})/);
  const bestMove = bestMoveMatch ? bestMoveMatch[1] : null;

  // Регулярное выражение для обработки ponder (если есть)
  const ponderMatch = line.match(/\sponder\s+(\S{4,6})$/);
  const ponder = ponderMatch ? ponderMatch[1] : null;

  return { bestMove, ponder };
}

const API_URL = "https://stockfish.online/api/s/v2.php";
const MOVE_DELAY = 500;

export const StockfishOnlineChessboard = ({
  className,
  defaultPosition,
}: StockfishOnlineChessboardProps) => {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const game = useMemo(() => new Chess(), []);

  defaultPosition = useMemo(
    () =>
      defaultPosition ||
      params.get(urlParams.chessDefaultPosition) ||
      game.fen(),
    [defaultPosition, params, game]
  );

  const [gamePosition, setGamePosition] = useState(defaultPosition);
  const [stockfishLevel, setStockfishLevel] =
    useState<keyof typeof levels>("easy");

  const abortControllerRef = useRef<AbortController>(null);
  // Загрузить начальную позицию
  useEffect(() => {
    game.load(defaultPosition);
  }, [defaultPosition, game]);

  function move(moveObj: { from: string; to: string; promotion?: string }) {
    const moved: {
      captured?: string;
      color: "w" | "b";
      from: Square;
      to: Square;
      san?: string;
      piece: Piece;
    } | null = game.move(moveObj);

    setGamePosition(game.fen());
    console.log(moved);
    if (moved === null) {
      return false;
    }

    if (game.game_over() || game.in_draw()) {
      sounds.checkmateSound.play();
      return false;
    }

    if (game.in_check()) {
      sounds.checkSound.play();
      return true;
    }

    if (moved.san === "O-O-O" || moved.san === "O-O") {
      sounds.castlingSound.play();
      return true;
    }

    if (moved.captured) {
      sounds.captureSound.play();
      return true;
    }

    sounds.moveSound.play();
    return true;
  }

  async function findBestMove() {
    try {
      const { controller, signal } =
        createNewAbortController(abortControllerRef);
      abortControllerRef.current = controller;

      const { data } = await axios.get<ApiResponse>(API_URL, {
        params: {
          fen: game.fen(),
          depth: levels[stockfishLevel].depth,
        },
        signal: signal,
      });

      console.log(data);

      if (!data.success) {
        console.error(data.data);
        return;
      }

      const { bestMove, ponder } = parseBestMoveLine(data.bestmove);

      console.log(bestMove, ponder);

      const notEnd = move({
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
        promotion: bestMove.slice(4, 6).toLowerCase(),
      });
    } catch (error) {
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    console.log(sourceSquare, targetSquare, piece);
    const notEnd = move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase(),
    });

    // Задержка чтобы компьютер не ходил моментально
    if (notEnd) {
      setTimeout(() => {
        findBestMove();
      }, MOVE_DELAY);
    }
    return notEnd;
  }

  return (
    <div className={classNames(cls.StockfishOnlineChessboard, {}, [className])}>
      <div className={cls.chessboardWrapper}>
        <div className={cls.buttons}>
          {Object.entries(levels).map(([level, config]) => (
            <Button
              key={`${level}`}
              onClick={() => setStockfishLevel(level)}
              theme={ButtonTheme.CLASSIC}
              active={stockfishLevel === level}
            >
              {config.text}
            </Button>
          ))}
        </div>

        <Chessboard
          id="chessboard"
          position={gamePosition}
          onPieceDrop={onDrop}
        />

        <div className={cls.buttons}>
          <Button
            onClick={() => {
              game.reset();
              setGamePosition(game.fen());
            }}
          >
            Новая игра
          </Button>
          <Button
            onClick={() => {
              game.undo();
              game.undo();
              setGamePosition(game.fen());
            }}
          >
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
};
