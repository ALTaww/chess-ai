const volume = 0.2;

export const sounds = {
  captureSound: new Audio("./sound/capture.mp3"),
  castlingSound: new Audio("./sound/castling.mp3"),
  checkSound: new Audio("./sound/check.mp3"),
  checkmateSound: new Audio("./sound/checkmate.mp3"),
  moveSound: new Audio("./sound/move.mp3"),
};

for (let key of Object.keys(sounds)) {
  sounds[key].volume = volume;
}
