import { MyChessAiChessboard } from "widgets/MyChessAiChessboard";

interface MyChessAiProps {
  className?: string;
}

const MyChessAi = ({ className }: MyChessAiProps) => {
  return (
    <div>
      <MyChessAiChessboard />
    </div>
  );
};

export default MyChessAi;
