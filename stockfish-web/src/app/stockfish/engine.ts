// documentation: https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html

const MINIMUM_DEPTH = 1;
const MAXIMUM_DEPTH = 24;

type EngineMessage = {
  /* исходное сообщение движка Stockfish */
  uciMessage: string;
  /* найден лучший ход для текущей позиции: e2e4 */
  bestMove?: string;
  /* ход «ponder» для противника: e7e5 */
  ponder?: string;
  /* оценка позиции (в пешечных единицах, ±cp/100) */
  positionEvaluation?: number;
  /* количество полуходов до мата, если найден мат */
  possibleMate?: number;
  /* строка с PV (последовательность ходов), разделёнными пробелами */
  pv?: string[];
  /* текущая глубина анализа */
  depth?: number;
};

export type EngineMessageCallback = (msg: EngineMessage) => void;

export default class Engine {
  private stockfish: Worker;
  private isInitialized = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private messageCallbacks = new Set<EngineMessageCallback>();
  private _depth = 5;
  private _thinkTime = 1000;

  constructor() {
    this.stockfish = new Worker("./stockfish.js");
    // создаём promise, который разрешится после получения первого 'readyok'
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    this.initializeEngine();
  }

  /**
   * Первый handshake с движком:
   * 1) Отправляем 'uci'
   * 2) Ждём 'readyok'
   *
   * После получения первого 'readyok' флаг this.isInitialized станет true,
   * и resolveReady() разрешит все методы, ожидающие готовности движка.
   */
  private initializeEngine() {
    this.stockfish.addEventListener("message", this.handleEngineMessage, {
      once: false,
    });

    // Запускаем UCI-режим
    this.stockfish.postMessage("uci");
    // Спрашиваем, готов ли движок
    this.stockfish.postMessage("isready");
  }

  private handleEngineMessage = (e: MessageEvent) => {
    const data: string = e.data;
    // Логируем raw-сообщения (можно отключить в production)
    console.log("[Engine →]", data);

    // Распарываем часть UCI-информации
    const msg = this.parseMessage(data);
    // Оповещаем всех внешних слушателей
    this.messageCallbacks.forEach((cb) => cb(msg));

    // Первый readyok после 'isready'
    if (data === "readyok" && !this.isInitialized) {
      this.isInitialized = true;
      // Разрешаем този, кто ждёт initial ready
      this.resolveReady();
      console.log("ENGINE IS INITIALIZED AND READY!");
    }
  };

  /**
   * Ждём, пока движок не ответит первым 'readyok'.
   * Все вызовы setOption…() будут ждать именно эту promise.
   */
  private async waitForInitialReady(): Promise<void> {
    if (!this.isInitialized) {
      await this.readyPromise;
    }
  }

  /**
   * Парсинг любого UCI-сообщения из движка в наш формат EngineMessage.
   */
  private parseMessage(data: string): EngineMessage {
    const bestMove = data.match(/bestmove\s+(\S+)/)?.[1];
    const ponder = data.match(/ponder\s+(\S+)/)?.[1];
    const cpMatch = data.match(/score cp\s+(-?\d+)/);
    const mateMatch = data.match(/score mate\s+(-?\d+)/);
    const depthMatch = data.match(/info.*\bdepth\s+(\d+)/);
    const pvMatch = data.match(/info.*\b pv\s+(.+)/);

    return {
      uciMessage: data,
      bestMove: bestMove || undefined,
      ponder: ponder || undefined,
      positionEvaluation: cpMatch ? parseInt(cpMatch[1], 10) / 100 : undefined,
      possibleMate: mateMatch ? parseInt(mateMatch[1], 10) : undefined,
      pv: pvMatch ? pvMatch[1].trim().split(/\s+/) : undefined,
      depth: depthMatch ? Number(depthMatch[1]) : undefined,
    };
  }

  /**
   * Добавляем внешнего слушателя — он будет получать каждый EngineMessage
   */
  addMessageListener(callback: EngineMessageCallback) {
    this.messageCallbacks.add(callback);
  }

  removeMessageListener(callback: EngineMessageCallback) {
    this.messageCallbacks.delete(callback);
  }

  /**
   * Отправка команды «остановиться» (прерывает текущий поиск).
   */
  stop() {
    this.stockfish.postMessage("stop");
  }

  /**
   * Полное завершение работы с движком:
   * - Останавливаем все вычисления
   * - Удаляем всех слушателей
   * - Отправляем 'quit'
   */
  terminate() {
    this.stop();
    this.stockfish.postMessage("quit");
    this.messageCallbacks.clear();
  }

  /****************************
   *   Методы установки опций  *
   ****************************/

  /**
   * Устанавливает уровень навыка (Skill Level).
   * Отложит команду, пока движок не станет ready впервые.
   */
  setSkillLevel(level: number) {
    this.waitForInitialReady().then(() => {
      this.stockfish.postMessage(`setoption name Skill Level value ${level}`);
    });
  }

  /**
   * Устанавливает максимальную глубину поиска (UCI_option "Depth").
   */
  setDepth(depth: number) {
    if (depth < MINIMUM_DEPTH) depth = MINIMUM_DEPTH;
    else if (depth > MAXIMUM_DEPTH) depth = MAXIMUM_DEPTH;
    this._depth = depth;

    this.waitForInitialReady().then(() => {
      this.stockfish.postMessage(`setoption name Depth value ${depth}`);
    });
    console.log(`Новая глубина поиска: ${this._depth}`);
  }

  /**
   * Устанавливает «think time» — ограничение по времени (в миллисекундах).
   * Само по себе значение не передаётся в setoption:
   * мы будем использовать его в goCommand (или можно снять ограничение).
   */
  setThinkTime(time: number) {
    this._thinkTime = time;
    console.log(`Новое время на ход (миллисекунды): ${this._thinkTime}`);
  }

  /**
   * Потоки, которые движок может использовать (UCI_option "Threads").
   *
   */
  setThreads(threads: number) {
    this.waitForInitialReady().then(() => {
      this.stockfish.postMessage(`setoption name Threads value ${threads}`);
    });
  }

  /**
   * Сколько вариантов (MultiPV) возвращать.
   */
  setMultiPV(n: number) {
    this.waitForInitialReady().then(() => {
      this.stockfish.postMessage(`setoption name MultiPV value ${n}`);
    });
  }

  /**
   * Включает или отключает ограничение по рейтингу, и задаёт Elo.
   * (UCI_option UCI_LimitStrength и UCI_Elo).
   */
  setLimitStrength(limit: boolean, elo = 1320) {
    this.waitForInitialReady().then(() => {
      this.stockfish.postMessage(
        `setoption name UCI_LimitStrength value ${limit ? "true" : "false"}`
      );
      // Если limit=false, значение UCI_Elo всё равно «примется», но не будет влиять.
      this.stockfish.postMessage(`setoption name UCI_Elo value ${elo}`);
    });
  }

  /*********************************************
   *    Основной метод: анализ позиции (go)     *
   *********************************************/

  /**
   * Запрашивает от движка лучший ход для позиции FEN.
   * Теперь каждый раз перед поиском мы:
   *  1) Останавливаем предыдущий поиск (stop)
   *  2) Посылаем 'ucinewgame', 'isready' → ждём нового 'readyok'
   *  3) Устанавливаем позицию → «go depth N»
   */
  async evaluatePosition(fen: string) {
    // Ждём, пока движок вообще инициализирован
    await this.waitForInitialReady();

    // 1) Прерываем предыдущий анализ (если он был)
    this.stop();

    // 2) Сбрасываем внутреннее состояние движка перед новым анализом
    await new Promise<void>((resolve) => {
      const onReadyForNewGame = (e: MessageEvent) => {
        if (e.data === "readyok") {
          this.stockfish.removeEventListener("message", onReadyForNewGame);
          resolve();
        }
      };
      this.stockfish.addEventListener("message", onReadyForNewGame);
      this.stockfish.postMessage("ucinewgame");
      this.stockfish.postMessage("isready");
    });

    // 3) Отправляем позицию
    this.stockfish.postMessage(`position fen ${fen}`);

    // 4) Формируем команду «go»
    const goCommand = `go depth ${this._depth} movetime ${this._thinkTime}`;
    console.log(`[Engine ←] ${goCommand}`);
    this.stockfish.postMessage(goCommand);
  }
}
