import { AnalysisBoard } from "widgets/AnalysisBoard";

interface AnalyzeProps {
  className?: string;
}

const Analyze = ({ className }: AnalyzeProps) => {
  return (
    <div>
      <AnalysisBoard />
    </div>
  );
};

export default Analyze;
