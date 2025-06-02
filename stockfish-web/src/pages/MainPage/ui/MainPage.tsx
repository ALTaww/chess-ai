import { Link } from "react-router-dom";
import { RoutePath } from "shared/config/routeConfig/routeConfig";

interface MainPageProps {
  className?: string;
}

const MainPage = ({ className }: MainPageProps) => {
  return (
    <div>
      <p>
        Страница <Link to={RoutePath.my_chess_ai}>"Простой ии"</Link> - ручной
        движок, не использующий существующие.
        <br />
        Работает по принципу:
        <br /> 1. Оценка позиции
        <br /> 2. Дерево поиска с помощью Minimax
        <br /> 3. Альфа-бета-обрезка
      </p>
      <br />
      <p>
        Страница <Link to={RoutePath.stockfish_online}>"Stockfish online"</Link>{" "}
        - Играть со стокфишем в через api stockfish.online.
      </p>
      <p>
        Страница <Link to={RoutePath.play}>"играть"</Link> - играть с
        компьютером.
      </p>
      <p>
        Страница <Link to={RoutePath.analyze}>"Анализировать позицию"</Link> -
        расставить нужную позицию и анализировать с помощью stockfish, Также
        подойдет для решений задач.
      </p>
      <p>
        Страница <Link to={RoutePath.board_editor}>"Редактор доски"</Link> -
        расставить нужную позицию на пустой доске
      </p>

      <br />
      <p>
        На всех страницах есть поле ввода fen строки, вы можете например
        расставить позицию на странице{" "}
        <Link to={RoutePath.board_editor}>"Редактора доски"</Link>, а потом
        сыграть её на странице <Link to={RoutePath.play}>"играть"</Link>
      </p>
    </div>
  );
};

export default MainPage;
