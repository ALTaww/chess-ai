## Об этом проекте

Проект представляет собой реализацию движков [Stockfish](https://stockfishchess.org/) и [REST API версии Stockfish online](https://stockfish.online/docs.php), использующую в качестве визуализации пакеты [chess.js](https://www.npmjs.com/package/chess.js?activeTab=readme) и [react-chessboard](https://github.com/Clariity/react-chessboard).

Также я написал ручной движок, не использующий готовые.
Работает по принципу:

1. Оценка позиции
2. Дерево поиска с помощью Minimax
3. Альфа-бета-обрезка

[Сайт для просмотра](https://altaww.github.io/chess-ai/)

Этот проект был запущен с помощью [Create React App](https://github.com/facebook/create-react-app).

Используется методология [feature-sliced design](https://feature-sliced.github.io/documentation/)

## О файлах

Файл общения с движком stockfish.js находится в `src/app/stockfish/engine.ts`

Реализации логики приложения находятся в папке `src/widgets/`:

1. `MyChessboard` - Игра со stockfish.js
2. `StockfishOnlineChessboard` - Игра со stockfish-online
3. `MyChessAiChessboard` - Minimax, Alpha-beta pruning 

## Перед установкой

Для того чтобы запустить проект на локальной машине вам необходимо установить [Node.js](https://nodejs.org/en)

## Доступные скрипты

В каталоге проекта (`$ cd stockfish-web`) вы можете запустить:

### `npm install`

Установит необходимые зависимости для запуска приложения

### `npm start`

Запускает приложение в режиме разработки.\
Откройте [http://localhost:3000/chess-ai](http://localhost:3000/chess-ai), чтобы просмотреть его в браузере.

Страница перезагрузится, если вы внесете изменения.\
Вы также увидите любые ошибки lint в консоли.

### `npm test`

Запускает средство запуска тестов в режиме интерактивного просмотра.

### `npm run build`

Собирает приложение для производства в папку `build`.\
Он правильно объединяет React в режиме производства и оптимизирует сборку для лучшей производительности.

Сборка минимизирована, а имена файлов включают хэши.
