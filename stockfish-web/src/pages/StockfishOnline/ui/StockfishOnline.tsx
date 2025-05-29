import { StockfishOnlineChessboard } from "widgets/StockfishOnlineChessboard";

interface StockfishOnlineProps {
  className?: string;
}

const StockfishOnline = ({ className }: StockfishOnlineProps) => {
  return (
    <div>
      <StockfishOnlineChessboard />
    </div>
  );
};

export default StockfishOnline;
