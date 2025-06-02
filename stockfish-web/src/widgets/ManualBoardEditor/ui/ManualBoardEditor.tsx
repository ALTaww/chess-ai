import { classNames } from "shared/lib/classNames/classNames";
import cls from "./ManualBoardEditor.module.scss";
import {
  Chessboard,
  ChessboardDnDProvider,
  SparePiece,
} from "react-chessboard";
import {
  BoardOrientation,
  Piece,
} from "react-chessboard/dist/chessboard/types";
import {
  ChangeEvent,
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from "react";
import Chess from "chess.js";
import { Button } from "shared/ui/Button/Button";
import { Input } from "shared/ui/Input/Input";
import { FenInput } from "shared/ui/FenInput/FenInput";

interface ManualBoardEditorProps {
  className?: string;
}

export const ManualBoardEditor = ({ className }: ManualBoardEditorProps) => {
  const game = useMemo(() => new Chess("8/8/8/8/8/8/8/8 w - - 0 1"), []); // пустая доска
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white"
  );
  const [boardWidth, setBoardWidth] = useState(360);
  const [fenPosition, setFenPosition] = useState<string>(game.fen());

  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    const success = game.put(
      {
        type,
        color,
      },
      targetSquare
    );
    if (success) {
      setFenPosition(game.fen());
    } else {
      alert(`На доске уже есть ${color === "w" ? "белый" : "черный"} КОРОЛЬ`);
    }
    return success;
  };
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();

    // это хак, чтобы обойти ошибку chess.js, которая исправлена в последней версии https://github.com/jhlywa/chess.js/pull/426
    game.remove(sourceSquare);
    game.remove(targetSquare);
    const success = game.put(
      {
        type,
        color,
      },
      targetSquare
    );
    if (success) setFenPosition(game.fen());
    return success;
  };
  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    setFenPosition(game.fen());
  };
  const handleFenInputChange = (fen: string) => {
    const { valid } = game.validate_fen(fen);

    if (valid) {
      game.load(fen);
      setFenPosition(game.fen());
    } else {
      console.log("Неправильный FEN");
    }
  };

  const pieces = [
    "wP",
    "wN",
    "wB",
    "wR",
    "wQ",
    "wK",
    "bP",
    "bN",
    "bB",
    "bR",
    "bQ",
    "bK",
  ];

  return (
    <div
      className={classNames(cls.ManualBoardEditor, {}, [className])}
      style={{
        margin: "0 auto",
        maxWidth: "60vh",
      }}
    >
      <ChessboardDnDProvider>
        <div>
          <div className={cls.piecesContainer}>
            {pieces.slice(6, 12).map((piece) => (
              <SparePiece
                key={piece}
                piece={piece as Piece}
                width={boardWidth / 8}
                dndId="ManualBoardEditor"
              />
            ))}
          </div>
          <Chessboard
            id="ManualBoardEditor"
            boardOrientation={boardOrientation}
            position={game.fen()}
            onSparePieceDrop={handleSparePieceDrop}
            onPieceDrop={handlePieceDrop}
            onPieceDropOffBoard={handlePieceDropOffBoard}
            dropOffBoardAction="trash"
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
          <div className={cls.piecesContainer}>
            {pieces.slice(0, 6).map((piece) => (
              <SparePiece
                key={piece}
                piece={piece as Piece}
                width={boardWidth / 8}
                dndId="ManualBoardEditor"
              />
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => {
              game.reset();
              setFenPosition(game.fen());
            }}
          >
            Начальная позиция ♟️
          </Button>
          <Button
            onClick={() => {
              game.clear();
              setFenPosition(game.fen());
            }}
          >
            Очистить доску 🗑️
          </Button>
          <Button
            onClick={() => {
              setBoardOrientation(
                boardOrientation === "white" ? "black" : "white"
              );
            }}
          >
            Перевернуть доску 🔁
          </Button>
        </div>
        <FenInput fenPosition={fenPosition} onChange={handleFenInputChange} />
        <p>Чтобы удалить фигуру из доски - вынесите её за пределы</p>
        <p>Чтобы первыми ходили черные - в поле ввода замените w на b</p>
      </ChessboardDnDProvider>
    </div>
  );
};
