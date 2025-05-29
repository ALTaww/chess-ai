import { lazy } from "react";

export const StockfishOnlineAsync = lazy(
  () =>
    new Promise((resolve) => {
      // @ts-ignore
      // Для примера загрузки
      setTimeout(() => resolve(import("./StockfishOnline")), 1500);
    })
);
