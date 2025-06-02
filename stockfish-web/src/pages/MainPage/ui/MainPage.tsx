import { Link } from "react-router-dom";
import { AppRoutes } from "shared/config/routeConfig/routeConfig";

interface MainPageProps {
  className?: string;
}

const MainPage = ({ className }: MainPageProps) => {
  return (
    <div>
      <p>
        Страница <Link to={AppRoutes.STOCKFISH_ONLINE}>"Stockfish online"</Link>{" "}
        - Играть со стокфишем в через api stockfish.online.
      </p>
      <p>
        Страница <Link to={AppRoutes.PLAY}>"играть"</Link> - играть с
        компьютером.
      </p>
      <p>
        Страница <Link to={AppRoutes.ANALYZE}>"Анализировать позицию"</Link> -
        расставить нужную позицию и анализировать с помощью stockfish, Также
        подойдет для решений задач.
      </p>
      <p>
        Страница <Link to={AppRoutes.BOARD_EDITOR}>"Редактор доски"</Link> -
        расставить нужную позицию на пустой доске
      </p>
      <br />
      <p>
        На всех страницах есть поле ввода fen строки, вы можете например
        расставить позицию на странице{" "}
        <Link to={AppRoutes.BOARD_EDITOR}>"Редактора доски"</Link>, а потом
        сыграть её на странице <Link to={AppRoutes.PLAY}>"играть"</Link>
      </p>
    </div>
  );
};

export default MainPage;
