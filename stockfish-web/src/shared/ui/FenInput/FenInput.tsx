import { classNames } from "shared/lib/classNames/classNames";
import cls from "./FenInput.module.scss";
import { Input } from "../Input/Input";
import { ChangeEvent, useState } from "react";
import { Button, ButtonTheme } from "../Button/Button";
import copyImg from "shared/assets/copy.png";
import krestImg from "shared/assets/krest.png";

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
  const [isNull, setIsNull] = useState(false);

  const handleFenInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fen = e.target.value;
    if (fen === "") return;
    setIsNull(false);
    if (onChange) {
      onChange(fen);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(fenPosition);
    console.log("copied");
  };

  const deleteFen = () => {
    setIsNull(true);
  };

  return (
    <div className={classNames(cls.FenInput, {}, [className])}>
      <Input
        value={isNull ? "" : fenPosition}
        onChange={handleFenInputChange}
        placeholder="Вставьте позицию FEN, чтобы начать редактирование"
      />
      <Button onClick={deleteFen} theme={ButtonTheme.CLEAR} square>
        <img src={krestImg} width={32} alt="Удалить" />
      </Button>
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
