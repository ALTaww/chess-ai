import { classNames } from "shared/lib/classNames/classNames";
import cls from "./FenInput.module.scss";
import { Input } from "../Input/Input";
import { ChangeEvent } from "react";
import { Button, ButtonSize, ButtonTheme } from "../Button/Button";
import copyImg from "shared/assets/copy.png";

interface FenInputProps {
  className?: string;
  fenPosition: string;
  onChange: (fen: string) => void;
}

export const FenInput = ({
  className,
  fenPosition,
  onChange,
}: FenInputProps) => {
  const handleFenInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(fenPosition);
    console.log("copied");
  };

  return (
    <div className={classNames(cls.FenInput, {}, [className])}>
      <Input
        value={fenPosition}
        onChange={handleFenInputChange}
        placeholder="Вставьте позицию FEN, чтобы начать редактирование"
      />
      <Button
        onClick={copy}
        theme={ButtonTheme.CLEAR}
        className={cls.copyButton}
        square
      >
        <img src={copyImg} alt="Копировать" />
      </Button>
    </div>
  );
};
