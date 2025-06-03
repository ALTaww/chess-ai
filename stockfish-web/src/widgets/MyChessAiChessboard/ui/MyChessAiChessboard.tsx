import { classNames } from "shared/lib/classNames/classNames";
import cls from "./MyChessAiChessboard.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import { sounds } from "shared/lib/sounds/sounds";
import { Modal } from "shared/ui/Modal/Modal";
import { Button } from "shared/ui/Button/Button";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { minimaxRoot } from "../lib/aiLogic";
import { FenInput } from "shared/ui/FenInput/FenInput";

interface MyChessAiChessboardProps {
  className?: string;
}

export const MyChessAiChessboard = ({
  className,
}: MyChessAiChessboardProps) => {
  const game = useMemo(() => new Chess(), []);
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [depth, setDepth] = useState(3);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white"
  );
  const [aiIsBlack, setAiIsBlack] = useState(false);
  const [isGameOverModal, setIsGameOverModal] = useState(false);

  const onToggleModal = useCallback(() => {
    setIsGameOverModal(!isGameOverModal);
  }, [isGameOverModal]);

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

  function findBestMove(isWhiteToMove: boolean) {
    console.log("selected depth: ", depth);
    console.log("ai is black? ", isWhiteToMove);
    const startDate = new Date();
    const bestMove = minimaxRoot(depth, game, !isWhiteToMove, startDate);
    move(bestMove);
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
        findBestMove(aiIsBlack);
      }, 500);
    }
    return notEnd;
  }

  const handleFenInputChange = (fen: string) => {
    const { valid } = game.validate_fen(fen);
    if (valid) {
      game.load(fen);
      setGamePosition(game.fen());
    }
  };

  return (
    <div className={classNames(cls.MyChessAiChessboard, {}, [className])}>
      <div className={cls.chessboardWrapper}>
        <Chessboard
          id="PlayVsMyAi"
          position={gamePosition}
          onPieceDrop={onDrop}
          boardOrientation={boardOrientation}
        />
        <div className={cls.buttons}>
          <Button
            onClick={() => {
              game.reset();
              setGamePosition(game.fen());
              setIsGameOverModal(false);
              setAiIsBlack(false);
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
              findBestMove(!aiIsBlack);
              setAiIsBlack(!aiIsBlack);
            }}
          >
            Ходи
          </Button>
        </div>
        <FenInput fenPosition={gamePosition} onChange={handleFenInputChange} />
        <div className="info">
          Глубина поиска:
          <select
            id="search-depth"
            value={`${depth}`}
            onChange={(e) => {
              const d = e.target.value;
              setDepth(+d);
            }}
          >
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={`${d}`} value={`${d}`}>
                {d}
              </option>
            ))}
          </select>
          <p>
            При выборе глубины, максимальное время обдумывания движка будет
            равно глубина * секунду
          </p>
        </div>
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
