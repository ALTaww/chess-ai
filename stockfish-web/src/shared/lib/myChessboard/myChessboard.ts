import Engine from "app/stockfish/engine";
import { sounds } from "../sounds/sounds";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";

class MyChessboard {
  _game: any;
  _engine: Engine;

  constructor(game: any, engine: Engine) {
    this._game = game;
    this._engine = engine;
  }

  get game() {
    return this._game;
  }

  get engine() {
    return this._engine;
  }
}
