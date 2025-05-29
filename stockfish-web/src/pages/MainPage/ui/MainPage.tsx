interface MainPageProps {
  className?: string;
}

const MainPage = ({ className }: MainPageProps) => {
  return (
    <div>
      <div>Страница "играть" - играть с компьютером или с другом.</div>
      <div>
        Страница "Анализировать позицию" - расставить нужную позицию и
        анализировать со stockfish'ем. <br />
        Также подойдет для решений задач.
      </div>
    </div>
  );
};

export default MainPage;
