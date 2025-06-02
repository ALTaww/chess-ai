import { classNames } from "shared/lib/classNames/classNames";
import cls from "./MyChessboard.module.scss";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Engine, { EngineMessageCallback } from "app/stockfish/engine";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { sounds } from "shared/lib/sounds/sounds";
import { useLocation } from "react-router-dom";
import { urlParams } from "shared/config/consts/urlParams";
import { Modal } from "shared/ui/Modal/Modal";
import { Input } from "shared/ui/Input/Input";
import { FenInput } from "shared/ui/FenInput/FenInput";

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
  threads?: number; // лучше не использовать
}

const levels: Record<string, LevelsConfig> = {
  easy: {
    text: "Легко 🤓",
    skill: 2,
    depth: 5,
    thinkTime: 500,
  },
  normal: {
    text: "Нормально 🧐",
    skill: 10,
    depth: 12,
    thinkTime: 1000,
  },
  hard: {
    text: "Сложно 😵",
    skill: 20,
    depth: 22,
    thinkTime: 3000,
  },
};

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

  // При смене уровня создаём (или перенастраиваем) движок
  useEffect(() => {
    // Если старый engine существует, завершаем его
    if (engineRef.current) {
      engineRef.current.terminate();
    }

    const engine = new Engine();
    engineRef.current = engine;

    const config = levels[stockfishLevel];

    // Сбрасываем лимит по рейтингу и настраиваем skill/depth/threads/multiPV
    engine.setLimitStrength(false);
    engine.setSkillLevel(config.skill);
    engine.setDepth(config.depth);
    engine.setThinkTime(config.thinkTime);

    if (config.elo) {
      engine.setLimitStrength(true, config.elo);
    }

    if (config.threads) {
      engine.setThreads(config.threads);
    }

    if (config.multiPV) {
      engine.setMultiPV(config.multiPV);
    }

    console.log(`Stockfish уровень: ${stockfishLevel}`, config);

    return () => {
      engine.terminate();
      engineRef.current = null;
    };
  }, [stockfishLevel]);

  // Загрузка начальной позиции в Chess.js
  useEffect(() => {
    game.load(defaultPosition);
  }, [defaultPosition, game]);

  function move(moveObj: {
    from: string;
    to: string;
    promotion?: string;
  }): boolean {
    const moved = game.move(moveObj);
    setGamePosition(game.fen());

    if (moved === null) {
      return false;
    }
    if (game.game_over() || game.in_draw()) {
      sounds.checkmateSound.play();
      setIsGameOverModal(true);
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

  // Обработчик ответов от Engine
  const handler: EngineMessageCallback = (message) => {
    console.log("[React ← EngineMessage]", message);

    const engine = engineRef.current;
    if (!engine) return;

    if (message.bestMove) {
      // Если есть лучший ход — сразу его выполняем
      const selectedMove = message.bestMove;
      const moveResult = move({
        from: selectedMove.substring(0, 2),
        to: selectedMove.substring(2, 4),
        promotion:
          selectedMove.length > 4 ? selectedMove.substring(4, 5) : undefined,
      });

      engine.removeMessageListener(handler);

      if (!moveResult) {
        engine.stop();
      }
    }
  };

  async function findBestMove() {
    const engine = engineRef.current;
    if (!engine) return;

    // Добавляем слушатель перед новой оценкой
    engine.addMessageListener(handler);
    console.log("Запрос лучшего хода…");

    try {
      await engine.evaluatePosition(game.fen());
    } catch (error) {
      engine.removeMessageListener(handler);
      throw error;
    }
  }

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    console.log(`[Player move] ${sourceSquare} → ${targetSquare}`, piece);
    const notEnd = move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase(),
    });

    if (notEnd) {
      setTimeout(() => {
        findBestMove();
      }, 500);
    }
    return notEnd;
  }

  const [isGameOverModal, setIsGameOverModal] = useState(false);

  const onToggleModal = useCallback(() => {
    setIsGameOverModal(!isGameOverModal);
  }, [isGameOverModal]);

  const handleFenInputChange = (fen: string) => {
    const { valid } = game.validate_fen(fen);
    if (valid) {
      game.load(fen);
      setGamePosition(game.fen());
    }
  };

  return (
    <div className={classNames(cls.MyChessboard, {}, [className || ""])}>
      <div className={cls.chessboardWrapper}>
        <div className={cls.buttons}>
          {Object.entries(levels).map(([level, config]) => (
            <Button
              key={level}
              onClick={() => setStockfishLevel(level as keyof typeof levels)}
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
        <FenInput fenPosition={gamePosition} onChange={handleFenInputChange} />
      </div>
      <Modal isOpen={isGameOverModal} onClose={onToggleModal}>
        <p>Игра окончена!</p>
        <div className={cls.buttons}>
          <Button
            onClick={() => {
              game.reset();
              setGamePosition(game.fen());
              setIsGameOverModal(false);
            }}
          >
            Новая игра
          </Button>
          <Button
            onClick={() => {
              setIsGameOverModal(false);
            }}
          >
            Назад
          </Button>
        </div>
      </Modal>
    </div>
  );
};
