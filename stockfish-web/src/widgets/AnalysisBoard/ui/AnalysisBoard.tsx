import { classNames } from "shared/lib/classNames/classNames";
import cls from "./AnalysisBoard.module.scss";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Engine, { EngineMessageCallback } from "app/stockfish/engine";
import Chess from "chess.js";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { sounds } from "shared/lib/sounds/sounds";
import { FenInput } from "shared/ui/FenInput/FenInput";
import { Modal } from "shared/ui/Modal/Modal";

interface AnalysisBoardProps {
  className?: string;
  defaultPosition?: string;
}

interface LevelsConfig {
  skill: number;
  depth: number;
  thinkTime: number;
  elo?: number;
  multiPV?: number;
  threads?: number;
}

// Уровни с комбинированными параметрами
const level: LevelsConfig = {
  skill: 20, // Максимальный уровень
  depth: 245, // Максимальная глубина
  thinkTime: 10000, // 10 сек
};

export const AnalysisBoard = ({
  className,
  defaultPosition,
}: AnalysisBoardProps) => {
  const game = useMemo(() => new Chess(), []);

  const engineRef = useRef<Engine | null>(null);
  const [chessBoardPosition, setChessBoardPosition] = useState(
    defaultPosition || game.fen()
  );
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(10);
  const [bestLine, setBestline] = useState<string[]>([]);
  const [possibleMate, setPossibleMate] = useState<number | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white"
  );

  useEffect(() => {
    // Если старый engine существует, завершаем его
    if (engineRef.current) {
      engineRef.current.terminate();
    }

    const engine = new Engine();
    engineRef.current = engine;

    const config = level;

    // Сбрасываем лимит по рейтингу и настраиваем skill/depth/threads/multiPV
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

    findBestMove();

    return () => {
      engine.terminate();
      engineRef.current = null;
    };
  }, []);

  function move(moveObj: {
    from: string;
    to: string;
    promotion?: string;
  }): boolean {
    const moved = game.move(moveObj);
    setChessBoardPosition(game.fen());

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
    // console.log("[React ← EngineMessage]", message);

    const engine = engineRef.current;
    if (!engine) return;

    const { depth, positionEvaluation, possibleMate, pv } = message;

    if (depth && depth < 10) return;
    positionEvaluation &&
      setPositionEvaluation(
        ((game.turn() === "w" ? 1 : -1) * Number(positionEvaluation)) / 100
      );
    possibleMate && setPossibleMate(possibleMate);
    depth && setDepth(depth);
    pv && setBestline(pv);
  };

  const findBestMove = async () => {
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
  };

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    const notEnd = move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase(),
    });
    setPossibleMate(null);

    setBestline([]);

    if (notEnd) {
      findBestMove();
    }
    return true;
  }

  const bestMove = bestLine[0];
  const handleFenInputChange = (fen: string) => {
    const { valid } = game.validate_fen(fen);
    if (valid) {
      game.load(fen);
      setChessBoardPosition(game.fen());
      setBestline([]);
      setPossibleMate(null);
      setDepth(null);
      findBestMove();
    }
  };

  const [isGameOverModal, setIsGameOverModal] = useState(false);

  const onToggleModal = useCallback(() => {
    setIsGameOverModal(!isGameOverModal);
  }, [isGameOverModal]);

  return (
    <div className={classNames(cls.AnalysisBoard, {}, [className])}>
      <div className={cls.chessboardWrapper}>
        <h4>
          Оценка позиции:{" "}
          {possibleMate ? `#${possibleMate}` : positionEvaluation.toFixed(4)}
          {"; "}
          Глубина: {depth}
        </h4>
        <h5 className={cls.bestLine}>
          Лучшая линия: <i>{bestLine.slice(0, 10).join(" ")}</i> ...
        </h5>
        <FenInput
          fenPosition={chessBoardPosition}
          onChange={handleFenInputChange}
        />
        <Chessboard
          id="AnalysisBoard"
          position={chessBoardPosition}
          onPieceDrop={onDrop}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customArrows={
            bestMove
              ? [
                  [
                    bestMove.substring(0, 2) as Square,
                    bestMove.substring(2, 4) as Square,
                    "rgb(0, 128, 0)",
                  ],
                ]
              : undefined
          }
          boardOrientation={boardOrientation}
        />
        <div className={cls.buttons}>
          <Button
            theme={ButtonTheme.CLASSIC}
            onClick={() => {
              setPossibleMate(null);
              setBestline([]);
              game.reset();
              setChessBoardPosition(game.fen());
              findBestMove();
            }}
          >
            Начальная позиция
          </Button>
          <Button
            theme={ButtonTheme.CLASSIC}
            onClick={() => {
              setPossibleMate(null);
              setBestline([]);
              game.undo();
              setChessBoardPosition(game.fen());
              findBestMove();
            }}
          >
            Назад
          </Button>
          <Button
            onClick={() => {
              setBoardOrientation(
                boardOrientation === "black" ? "white" : "black"
              );
            }}
          >
            Перевернуть доску
          </Button>
          <Button
            onClick={() => {
              findBestMove();
            }}
          >
            Анализируй
          </Button>
        </div>
      </div>
      <Modal isOpen={isGameOverModal} onClose={onToggleModal}>
        <p>Игра окончена!</p>
        <div className={cls.buttons}>
          <Button
            onClick={() => {
              game.reset();
              setChessBoardPosition(game.fen());
              setIsGameOverModal(false);
              findBestMove();
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
