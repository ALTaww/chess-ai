import { classNames } from "shared/lib/classNames/classNames";
import cls from "./AnalysisBoard.module.scss";

interface AnalysisBoardProps {
  className?: string;
}

export const AnalysisBoard = ({ className }: AnalysisBoardProps) => {
  return (
    <div className={classNames(cls.AnalysisBoard, {}, [className])}>
      Пока ничего...
    </div>
  );
};

// import { classNames } from "shared/lib/classNames/classNames";
// import cls from "./AnalysisBoard.module.scss";
// import { useEffect, useMemo, useRef, useState } from "react";
// import Engine, { EngineMessageCallback } from "app/stockfish/engine";
// import Chess from "chess.js";
// import { Button } from "shared/ui/Button/Button";
// import { Chessboard } from "react-chessboard";
// import { Square } from "react-chessboard/dist/chessboard/types";

// interface AnalysisBoardProps {
//   className?: string;
// }

// interface LevelsConfig {
//   text: string;
//   skill: number;
//   depth: number;
//   thinkTime: number;
//   elo?: number;
//   multiPV?: number;
//   threads?: number;
// }

// // Уровни с комбинированными параметрами
// const levels: Record<string, LevelsConfig> = {
//   hard: {
//     text: "Сложно 😵",
//     skill: 20, // Максимальный уровень
//     depth: 22, // Глубокая аналитика
//     thinkTime: 3000,
//     threads: 6, // Использовать больше потоков
//     multiPV: 1, // Только лучший вариант
//   },
// };

// export const AnalysisBoard = ({ className }: AnalysisBoardProps) => {
//   const engine = useMemo(() => new Engine(), []);
//   const game = useMemo(() => new Chess(), []);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [chessBoardPosition, setChessBoardPosition] = useState(game.fen());
//   const [positionEvaluation, setPositionEvaluation] = useState(0);
//   const [depth, setDepth] = useState(10);
//   const [bestLine, setBestline] = useState("");
//   const [possibleMate, setPossibleMate] = useState("");

//   const config: LevelsConfig = {
//     text: "Сложно 😵",
//     skill: 20, // Максимальный уровень
//     depth: 22, // Глубокая аналитика
//     thinkTime: 3000,
//     threads: 6, // Использовать больше потоков
//     multiPV: 1, // Только лучший вариант
//   };

//   useEffect(() => {
//     const config = levels["hard"];

//     // Всегда сбрасываем ограничение силы перед настройкой
//     engine.setLimitStrength(false);

//     // Настройка параметров
//     engine.setSkillLevel(config.skill);
//     engine.setDepth(config.depth);

//     if (config.elo) {
//       engine.setLimitStrength(true, config.elo);
//     }

//     if (config.threads) {
//       engine.setThreads(config.threads);
//     }

//     if (config.multiPV) {
//       engine.setMultiPV(config.multiPV);
//     } else {
//       engine.setMultiPV(1);
//     }
//   }, [engine]);

//   // Создаем уникальную ссылку на обработчик
//   const handler: EngineMessageCallback = (message) => {
//     const { positionEvaluation, possibleMate, pv, depth } = message;

//     if (depth && depth < 10) return;
//     positionEvaluation &&
//       setPositionEvaluation(
//         ((game.turn() === "w" ? 1 : -1) * Number(positionEvaluation)) / 100
//       );
//     possibleMate && setPossibleMate(`${possibleMate}`);
//     depth && setDepth(depth);
//     pv && setBestline(pv);

//     console.log(message);
//     console.log("Best move received:", message.bestMove);

//     const variants: string[] = [];

//     if (message.pv && message.bestMove) {
//       variants.push(message.bestMove);

//       const selectedMove = selectBestMove(variants);

//       const moveResult = move({
//         from: selectedMove.substring(0, 2),
//         to: selectedMove.substring(2, 4),
//         promotion: selectedMove.substring(4, 5),
//       });

//       // Удаляем обработчик независимо от результата хода
//       engine.removeMessageListener(handler);

//       if (!moveResult) {
//         engine.stop();
//       }
//     }
//   };

//   async function findBestMove() {
//     // Добавляем обработчик перед запуском анализа
//     engine.addMessageListener(handler);
//     console.log("finding best move...");

//     try {
//       await engine.evaluatePosition(game.fen(), config.thinkTime);
//     } catch (error) {
//       engine.removeMessageListener(handler);
//       throw error;
//     }
//   }

//   // function findBestMove() {
//   //   engine.evaluatePosition(chessBoardPosition, 18);
//   //   engine.onMessage(({ positionEvaluation, possibleMate, pv, depth }) => {
//   //     if (depth && depth < 10) return;
//   //     positionEvaluation &&
//   //       setPositionEvaluation(
//   //         ((game.turn() === "w" ? 1 : -1) * Number(positionEvaluation)) / 100
//   //       );
//   //     possibleMate && setPossibleMate(possibleMate);
//   //     depth && setDepth(depth);
//   //     pv && setBestline(pv);
//   //   });
//   // }

//   function onDrop(sourceSquare, targetSquare, piece) {
//     const move = game.move({
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: piece[1].toLowerCase() ?? "q",
//     });
//     setPossibleMate("");
//     setChessBoardPosition(game.fen());

//     // illegal move
//     if (move === null) return false;
//     engine.stop();
//     setBestline("");
//     if (game.game_over() || game.in_draw()) return false;
//     return true;
//   }

//   useEffect(() => {
//     if (!game.game_over() || game.in_draw()) {
//       findBestMove();
//     }
//   }, [chessBoardPosition]);

//   const bestMove = bestLine?.split(" ")?.[0];
//   const handleFenInputChange = (e) => {
//     const { valid } = game.validate_fen(e.target.value);
//     if (valid && inputRef.current) {
//       inputRef.current.value = e.target.value;
//       game.load(e.target.value);
//       setChessBoardPosition(game.fen());
//     }
//   };

//   return (
//     <div className={classNames(cls.AnalysisBoard, {}, [className])}>
//       <h4>
//         Position Evaluation:{" "}
//         {possibleMate ? `#${possibleMate}` : positionEvaluation}
//         {"; "}
//         Depth: {depth}
//       </h4>
//       <h5>
//         Best line: <i>{bestLine.slice(0, 40)}</i> ...
//       </h5>
//       <input
//         ref={inputRef}
//         style={{
//           width: "90%",
//         }}
//         onChange={handleFenInputChange}
//         placeholder="Paste FEN to start analysing custom position"
//       />
//       <Chessboard
//         id="AnalysisBoard"
//         position={chessBoardPosition}
//         onPieceDrop={onDrop}
//         customBoardStyle={{
//           borderRadius: "4px",
//           boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
//         }}
//         customArrows={
//           bestMove
//             ? [
//                 [
//                   bestMove.substring(0, 2) as Square,
//                   bestMove.substring(2, 4) as Square,
//                   "rgb(0, 128, 0)",
//                 ],
//               ]
//             : undefined
//         }
//       />
//       <button
//         onClick={() => {
//           setPossibleMate("");
//           setBestline("");
//           game.reset();
//           setChessBoardPosition(game.fen());
//         }}
//       >
//         reset
//       </button>
//       <Button
//         onClick={() => {
//           setPossibleMate("");
//           setBestline("");
//           game.undo();
//           setChessBoardPosition(game.fen());
//         }}
//       >
//         undo
//       </Button>
//     </div>
//   );
// };
