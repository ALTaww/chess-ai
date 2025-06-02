## Об этом проекте

Проект представляет собой реализацию движков [Stockfish](https://stockfishchess.org/) и [REST API версии Stockfish online](https://stockfish.online/docs.php), использующую в качестве визуализации пакеты [chess.js](https://www.npmjs.com/package/chess.js?activeTab=readme) и [react-chessboard](https://github.com/Clariity/react-chessboard)

Этот проект был запущен с помощью [Create React App](https://github.com/facebook/create-react-app).

## Перед установкой

Для того чтобы запустить проект на локальной машине вам необходимо установить [Node.js](https://nodejs.org/en)

## Доступные скрипты

В каталоге проекта ($ cd stockfish-web) вы можете запустить:

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
