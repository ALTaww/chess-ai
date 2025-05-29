import { classNames } from "shared/lib/classNames/classNames";
import cls from "./MyChessboard.module.scss";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { useEffect, useMemo, useRef, useState } from "react";
import Engine, { EngineMessageCallback } from "app/stockfish/engine";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { sounds } from "shared/lib/sounds/sounds";
import { useLocation, useParams } from "react-router-dom";
import { urlParams } from "shared/config/consts/urlParams";

interface MyChessboardProps {
  className?: string;
  defaultPosition?: string;
}

interface LevelsConfig {
  text: string;
  skill: number;
  depth: number;
  thinkTime: number;
  elo?: number;
  multiPV?: number;
  threads?: number;
}

// Уровни с комбинированными параметрами
const levels: Record<string, LevelsConfig> = {
  easy: {
    text: "Легко 🤓",
    skill: 2, // Минимальный уровень навыка
    // elo: 1350, // Ограничение по рейтингу
    depth: 5, // Ограниченная глубина
    thinkTime: 500, // Малое время на ход
    multiPV: 3,
  },
  normal: {
    text: "Нормально 🧐",
    skill: 10, // Средний уровень
    depth: 12, // Умеренная глубина
    thinkTime: 1000,
    multiPV: 3, // Рассматривать несколько вариантов
  },
  hard: {
    text: "Сложно 😵",
    skill: 20, // Максимальный уровень
    depth: 22, // Глубокая аналитика
    thinkTime: 3000,
    threads: 6, // Использовать больше потоков
    multiPV: 1, // Только лучший вариант
  },
};

const MAX_ENGINE_THINK_TIME = 1000;
const OPENING_MOVES = 10;

export const MyChessboard = ({
  className,
  defaultPosition,
}: MyChessboardProps) => {
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

  const engineRef = useRef<Engine | null>(null);
  const [gamePosition, setGamePosition] = useState(
    defaultPosition || params.get(urlParams.chessDefaultPosition) || game.fen()
  );
  const [stockfishLevel, setStockfishLevel] =
    useState<keyof typeof levels>("easy");
  const [isOpening, setIsOpening] = useState(true);

  useEffect(() => {
    const engine = new Engine();
    engineRef.current = engine;

    const config = levels[stockfishLevel];

    // Всегда сбрасываем ограничение силы перед настройкой
    engine.setLimitStrength(false);

    // Настройка параметров
    engine.setSkillLevel(config.skill);
    engine.setDepth(config.depth);

    if (config.elo) {
      engine.setLimitStrength(true, config.elo);
    }

    if (config.threads) {
      engine.setThreads(config.threads);
    }

    if (config.multiPV) {
      engine.setMultiPV(config.multiPV);
    } else {
      engine.setMultiPV(1);
    }

    console.log(`Stockfish level set to: ${stockfishLevel}`, config);
  }, [stockfishLevel, engineRef]);

  // Загрузить начальную позицию
  useEffect(() => {
    game.load(defaultPosition);
  }, [defaultPosition, game]);

  function selectBestMove(moves: string[]): string {
    const randomness = 0.3;
    // Чем выше randomness, тем более случайный выбор
    const weights = moves.map((_, i) => Math.exp(-i * randomness));
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    return (
      moves.find((_, i) => {
        random -= weights[i];
        return random <= 0;
      }) || moves[0]
    );
  }

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

    if (game.history().length >= OPENING_MOVES) {
      setIsOpening(false);
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

  // Создаем уникальную ссылку на обработчик
  const handler: EngineMessageCallback = (message) => {
    console.log(message);
    console.log("Best move received:", message.bestMove);

    const engine = engineRef.current;

    const variants: string[] = [];

    if (message.pv && message.bestMove) {
      variants.push(message.bestMove);

      const selectedMove = selectBestMove(variants);

      const moveResult = move({
        from: selectedMove.substring(0, 2),
        to: selectedMove.substring(2, 4),
        promotion: selectedMove.substring(4, 5),
      });

      // Удаляем обработчик независимо от результата хода
      engine.removeMessageListener(handler);

      if (!moveResult) {
        engine.stop();
      }
    }
  };

  async function findBestMove() {
    const engine = engineRef.current;
    // Добавляем обработчик перед запуском анализа
    engine.addMessageListener(handler);
    console.log("finding best move...");

    try {
      await engine.evaluatePosition(
        game.fen(),
        isOpening ? Math.ceil(MAX_ENGINE_THINK_TIME / 2) : MAX_ENGINE_THINK_TIME
      );
    } catch (error) {
      engine.removeMessageListener(handler);
      throw error;
    }
  }

  // Очистка при размонтировании
  useEffect(() => {
    return () => engineRef.current.terminate();
  }, [engineRef]);

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
      }, 500);
    }
    return notEnd;
  }

  return (
    <div className={classNames(cls.MyChessboard, {}, [className])}>
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
          id="PlayVsStockfish"
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
