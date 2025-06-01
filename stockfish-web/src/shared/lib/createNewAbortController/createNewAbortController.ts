export function createNewAbortController(
  abortControllerRef: React.RefObject<AbortController | null>
): { controller: AbortController; signal: AbortSignal } {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort(); // Отменяем предыдущие запросы
  }
  abortControllerRef.current = new AbortController(); // Создаём новый AbortController
  return {
    controller: abortControllerRef.current,
    signal: abortControllerRef.current.signal,
  };
}
