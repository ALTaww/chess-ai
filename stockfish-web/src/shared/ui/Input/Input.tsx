import { classNames } from "shared/lib/classNames/classNames";
import cls from "./Input.module.scss";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = (props: InputProps) => {
  const { className, ...restProps } = props;
  return (
    <input className={classNames(cls.Input, {}, [className])} {...restProps} />
  );
};
