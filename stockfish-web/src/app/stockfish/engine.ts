// documentation: https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html

const MINIMUM_DEPTH = 1;
const MAXIMUM_DEPTH = 24;
const NUMBER_OF_THREADS = 4;

type EngineMessage = {
  /* сообщение движка stockfish в формате UCI */
  uciMessage: string;
  /* найден лучший ход для текущей позиции в формате `e2e4`*/
  bestMove?: string;
  /* найден лучший ход для противника в формате `e7e5` */
  ponder?: string;
  /*  разница материального баланса в центипешках (ВАЖНО! Stockfish дает счет cp в зависимости от того, чей сейчас ход) */
  positionEvaluation?: number;
  /* количество ходов до мата */
  possibleMate?: number;
  /* лучшие найденные ходы */
  pv?: string[];
  /* количество полуходов, на которые двигатель смотрит вперед */
  depth?: number;
};

export type EngineMessageCallback = (msg: EngineMessage) => void;

export default class Engine {
  private stockfish: Worker;
  private readyPromise: Promise<void>;
  private resolveReady: (value: void | PromiseLike<void>) => void;
  private abortController = new AbortController();
  private messageCallbacks = new Set<EngineMessageCallback>();
  private _depth: number;
  private _thinkTime = 1000;

  constructor() {
    this.stockfish = new Worker("./stockfish.js");

    // Создаем промис для отслеживания готовности
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    this.initializeEngine();
    this.setThreads(NUMBER_OF_THREADS);
  }

  private initializeEngine() {
    // Добавляем обработчик ДО отправки сообщений
    this.stockfish.addEventListener("message", this.handleEngineMessage, {
      signal: this.abortController.signal,
      once: false,
    });

    this.stockfish.postMessage("uci");
    this.stockfish.postMessage("isready");
  }

  private handleEngineMessage = (e: MessageEvent) => {
    console.log("Engine message:", e.data); // Логируем все сообщения
    const msg = this.parseMessage(e.data);
    // Оповещаем подписчиков
    this.messageCallbacks.forEach((cb) => cb(msg));

    if (e.data === "readyok") {
      this.resolveReady(); // Разрешаем промис готовности
      console.log("ENGINE IS READY!");
    }
  };

  // Асинхронный метод ожидания готовности
  private waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  private parseMessage(data: string): EngineMessage {
    return {
      uciMessage: data,
      bestMove: data.match(/bestmove\s+(\S+)/)?.[1],
      ponder: data.match(/ponder\s+(\S+)/)?.[1],
      positionEvaluation: this.parseEvaluation(data),
      possibleMate: this.parseMate(data),
      pv: data.match(/ pv\s+(.*)/)?.[1].split(" "),
      depth: Number(data.match(/ depth\s+(\d+)/)?.[1]),
    };
  }

  private parseEvaluation(data: string): number | undefined {
    const match = data.match(/cp\s+(-?\d+)/);
    return match ? parseInt(match[1], 10) / 100 : undefined;
  }

  private parseMate(data: string): number | undefined {
    const match = data.match(/mate\s+(-?\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  get depth() {
    return this._depth;
  }

  get thinkTime() {
    return this._thinkTime;
  }

  addMessageListener(callback: (msg: EngineMessage) => void) {
    this.messageCallbacks.add(callback);
  }

  removeMessageListener(callback: (msg: EngineMessage) => void) {
    this.messageCallbacks.delete(callback);
  }

  async evaluatePosition(fen: string, thinkTime?: number) {
    console.log("evaluationg position...");
    console.log("waiting for engine ready...");
    await this.waitForReady();
    console.log("promise is ready");

    this.stop(); // Останавливаем предыдущий анализ

    this.stockfish.postMessage(`position fen ${fen}`);

    console.log("current depth is ", this.depth);
    let goCommand = "go";
    goCommand += ` depth ${this.depth}`;
    goCommand += ` movetime ${thinkTime}`;

    console.log("go command: ", goCommand);

    this.stockfish.postMessage(goCommand);

    // Автоматическая остановка по таймауту
    // if (thinkTime) {
    //   this.currentTimer = setTimeout(() => {
    //     this.stop();
    //   }, thinkTime);
    // }
  }

  stop() {
    // if (this.currentTimer) {
    //   clearTimeout(this.currentTimer);
    //   this.currentTimer = undefined;
    // }
    this.stockfish.postMessage("stop");
  }

  terminate() {
    this.stop();
    this.abortController.abort();
    this.stockfish.postMessage("quit");
    this.messageCallbacks.clear();
  }

  // Дополнительные методы
  setThinkTime(time: number) {
    this._thinkTime = time;
  }

  setDepth(depth: number) {
    if (depth < MINIMUM_DEPTH) depth = MINIMUM_DEPTH;
    else if (depth > MAXIMUM_DEPTH) depth = MAXIMUM_DEPTH;
    this._depth = depth;
    console.log(`depth of stockfish is set to ${this.depth}`);
  }

  setSkillLevel(level: number) {
    this.stockfish.postMessage(`setoption name Skill Level value ${level}`);
  }

  setThreads(threads: number) {
    this.stockfish.postMessage(`setoption name Threads value ${threads}`);
  }

  setMultiPV(n: number) {
    this.stockfish.postMessage(`setoption name MultiPV value ${n}`);
  }

  setLimitStrength(limit: boolean, elo = 1320) {
    this.stockfish.postMessage(
      `setoption name UCI_LimitStrength value ${limit}`
    );
    this.stockfish.postMessage(`setoption name UCI_Elo value ${elo}`);
  }
}
