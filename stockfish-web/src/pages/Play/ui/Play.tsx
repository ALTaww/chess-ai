import { MyChessboard } from "widgets/MyChessboard";

interface PlayProps {
  className?: string;
}

const Play = ({ className }: PlayProps) => {
  return (
    <div>
      <MyChessboard />
    </div>
  );
};

export default Play;
